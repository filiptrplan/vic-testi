from django.shortcuts import render
from django.http import JsonResponse
from django.conf import settings
from django.http import HttpResponse, HttpResponseBadRequest
from django.views.generic.detail import DetailView
from tests.models import Professor, TestImage, Test, Subject
import tests.upload

def search(request):
    """
    Serves the search template, provides professors as context
    """
    professors = Professor.objects.all()
    subjects = Subject.objects.all()
    context = { "professors": professors, "subjects": subjects }
    return render(request, 'tests/search.html', context)


def search_ajax(request):
    return

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
    if request.method == "POST":
        if(request.POST['year'] == 'undefined' or request.POST['professorId'] == 'undefined' or \
        len(request.POST.getlist('fileLocations')) == 0):
            return HttpResponseBadRequest()
        professor = Professor.objects.get(id=int(request.POST['professorId']))
        year = int(request.POST['year'])

        test = Test(year=year, professor=professor)
        test.save()

        file_locations = request.POST.getlist('fileLocations')
        for location in file_locations:
            test_image = TestImage(file=location)
            test_image.test = test
            test_image.save()
        return HttpResponse()
    else:
        return HttpResponseBadRequest()
    