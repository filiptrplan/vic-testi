from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
from django.http import HttpResponse, HttpResponseBadRequest
from django.views.generic.detail import DetailView
from django.contrib.postgres.search import SearchVector, SearchQuery, TrigramSimilarity
from django.db.models.functions import Greatest
from tests.models import Professor, TestImage, Test, Subject
from django.core.paginator import Paginator, Page
import tests.upload
import requests;

def search(request):
    """
    Serves the search template, provides professors as context
    """
    professors = Professor.objects.all()
    subjects = Subject.objects.all()
    context = { "professors": professors, "subjects": subjects }
    return render(request, 'tests/search.html', context)


def search_ajax(request):
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

class TestDetailView(DetailView):
    model = Test
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['files'] = TestImage.objects.filter(test=self.get_object())
        return context

def test_links(request, pk):
    # Ali pa Test.objects.get(pk=pk).test_image_set.all()
    images=TestImage.objects.filter(test__id=pk).values_list('file')
    files=[]
    for image in list(images):
        files.append(image[0])
    
    return JsonResponse({'links': files})


# Check out class views
def upload(request):
    """
    Serves the upload template, provides professors as context
    """
    professors = Professor.objects.all()
    context = { "professors": professors }
    return render(request, 'tests/upload.html', context)

def get_signature(request):
    """Serves as an endpoint to get a presigned post form
    """
    file_name = request.POST['file_name']
    sig = tests.upload.generate_post_signature(settings.AWS_KEY_NAME, file_name)
    return JsonResponse(sig)

def create_test(request):
    """Creates a test object from parameters
    """
    if request.method != "POST":
        return HttpResponseBadRequest()
        
    if(request.POST['year'] == 'undefined' or request.POST['professorId'] == 'undefined' or \
    len(request.POST.getlist('fileLocations')) == 0):
        return HttpResponseBadRequest()

    # Check if user is member of the group
    fbResponse = requests.get('https://graph.facebook.com/me/groups', params={
        'access_token': request.POST['fb_token']
    })
    fbGroups = fbResponse.json()['data']
    fbGroupID = settings.FB_GROUP_ID
    # Finds the group with the ID or returns None
    fbGroupAuth = next((x for x in fbGroups if x['id'] == fbGroupID), None)
    if(fbGroupAuth is None):
        return JsonResponse({'error': 'not_group_member'}, status=500)

    fbResponse = requests.get('https://graph.facebook.com/me', params={
        'access_token': request.POST['fb_token'],
        'fields': 'id'
    })
    fbUserID = fbResponse.json()['id']

    professor = Professor.objects.get(id=int(request.POST['professorId']))
    year = int(request.POST['year'])

    test = Test(year=year, professor=professor, fb_user_id=fbUserID)

    if(request.POST.get('note') is not None):
        test.additional_note = request.POST.get('note')

    test.save()

    file_locations = request.POST.getlist('fileLocations')
    for location in file_locations:
        test_image = TestImage(file=location)
        test_image.test = test
        test_image.save()
    return HttpResponse()
        
    