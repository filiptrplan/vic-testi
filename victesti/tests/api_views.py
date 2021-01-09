from django.http import JsonResponse
from django.conf import settings
from django.http import HttpResponse, HttpResponseBadRequest
from django.contrib.postgres.search import SearchVector, SearchQuery, TrigramSimilarity
from django.db.models.functions import Greatest
from django.core.paginator import Paginator
from django.urls import reverse
import requests
from .s3 import s3_delete_objects, s3_generate_post_signature, s3_delete_object
from .models import Professor, TestImage, Test, Subject


def test_is_owner(request, pk):
    if test_is_owner_helper(pk, request):
        return JsonResponse({'owner': True})
    else:
        return JsonResponse({'owner': False})

def test_is_owner_helper(pk, request):
    fb_user_id = Test.objects.filter(id=pk)[0].uploader.fb_id
    if request.user.fb_id == fb_user_id:
        return True
    else:
        return False

def search(request):
    query = request.GET.get('query')
    sort = request.GET.get('sort')
    is_paginated = False
    page_exceeded = False

    if(request.method != "GET" or query is None or sort is None):
        return HttpResponseBadRequest()

    # If the text query is empty just take all objects as the QuerySet
    if query != '':
        tests = Test.objects.annotate(
            similarity=Greatest(
                TrigramSimilarity('professor__first_name', query),
                TrigramSimilarity('professor__last_name', query),
                TrigramSimilarity('professor__subject__name', query),
            )
        ).filter(similarity__gt=0.3).order_by('-similarity')
        
        # If the trigram similarity fails try the search vectors
        # Already tried combining results but it seems more trouble than it's worth
        if tests.count() == 0:
            tests = Test.objects.annotate(
                search=SearchVector('professor__first_name', 'professor__last_name', 'professor__subject__name', 'year')
            ).filter(search=SearchQuery(query)).order_by('-professor__first_name')

    else:
        tests = Test.objects.all()

    if sort == 'date_asc':
        tests = tests.order_by('created_at')
    if sort == 'date_desc':
        tests = tests.order_by('-created_at')

    year_query = request.GET.get('year')
    if year_query is not None:
        tests = tests.filter(year=year_query)

    professor_query = request.GET.get('professor')
    if professor_query is not None:
        tests = tests.filter(professor=professor_query)

    subject_query = request.GET.get('subject')
    if subject_query is not None:
        tests = tests.filter(professor__subject=subject_query)

    page_query = request.GET.get('page')
    if page_query is not None:
        is_paginated = True
        pagination_query = request.GET.get('pagination')
        if pagination_query is not None:
            pagination = pagination_query
        else:
            pagination = 10
        
        tests_pagination = Paginator(tests, pagination)
        if(int(page_query) <= tests_pagination.num_pages):
            current_page = tests_pagination.page(page_query)
        else:
            current_page = tests_pagination.page(tests_pagination.num_pages)

    professors = Professor.objects.annotate(
        similarity=Greatest(
            TrigramSimilarity('first_name', query),
            TrigramSimilarity('last_name', query),
        )
    ).filter(similarity__gt=0.3).order_by('-similarity')

    subjects = Subject.objects.annotate(
        similarity=TrigramSimilarity('name', query),
    ).filter(similarity__gt=0.3).order_by('-similarity')

    response_data = {
        'tests': list(tests.values()),
        'professors': list(professors.values()),
        'subjects': list(subjects.values()),
        }
    
    if is_paginated == True:
        response_data['tests'] = list(current_page.object_list.values())
        response_data['page_count'] = tests_pagination.num_pages

    return JsonResponse(response_data)

def test_links(request, pk):
    # Ali pa Test.objects.get(pk=pk).test_image_set.all()
    images=TestImage.objects.filter(test__id=pk).values_list('file')
    files=[]
    for image in list(images):
        files.append(image[0])
    
    return JsonResponse({'links': files})

def get_signature(request):
    """Serves as an endpoint to get a presigned post form
    """
    file_name = request.POST['file_name']
    sig = s3_generate_post_signature(settings.AWS_KEY_NAME, file_name)
    return JsonResponse(sig)

def create_test(request):
    """Creates a test object from parameters
    """
    file_locations = request.POST.getlist('fileLocations')

    if request.method != "POST":
        s3_delete_objects(file_locations)
        return HttpResponseBadRequest()
        
    if(request.POST['year'] == 'undefined' or request.POST['professorId'] == 'undefined' or \
    len(request.POST.getlist('fileLocations')) == 0):
        s3_delete_objects(file_locations)
        return JsonResponse({'error': 'bad_data'}, status=500)

    if request.user.is_authenticated == False:
        return JsonResponse({'error': 'not_logged_in'}, status=500)

    professor = Professor.objects.get(id=int(request.POST['professorId']))
    year = int(request.POST['year'])

    test = Test(year=year, professor=professor, uploader=request.user)

    if(request.POST.get('note') is not None):
        test.additional_note = request.POST.get('note')

    test.save()

    
    for location in file_locations:
        test_image = TestImage(file=location)
        test_image.test = test
        test_image.save()

    redirect_url = reverse('tests.detail', kwargs={'pk': test.id})

    return JsonResponse({'redirect': redirect_url})

def test_delete(request, pk):
    if test_is_owner_helper(pk, request):
        test_images = TestImage.objects.filter(test__id=pk)
        for test_image in test_images:
            file = test_image.file
            # If 2 TestImage objects share the resource, don't delete it
            if TestImage.objects.filter(file=file).count() < 2:
                s3_delete_object(file)
            test_image.delete()
        Test.objects.filter(id=pk).delete()
        return HttpResponse()
    else:
        return JsonResponse({'error': 'is_not_owner'}, status=500)

def test(request, pk):
    test = Test.objects.get(id=pk)
    return JsonResponse({
        'id': test.id,
        'professor_first_name': test.professor.first_name,
        'professor_last_name': test.professor.last_name,
        'year': test.year
    })
