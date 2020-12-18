from django.shortcuts import render
from django.http import JsonResponse
from django.views.generic.detail import DetailView
from tests.models import Professor, TestImage, Test, Subject

def search(request):
    """
    Serves the search template, provides professors as context
    """
    professors = Professor.objects.all()
    subjects = Subject.objects.all()
    context = { "professors": professors, "subjects": subjects }
    return render(request, 'tests/search.html', context)

class TestDetailView(DetailView):
    model = Test
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['files'] = TestImage.objects.filter(test=self.get_object())
        return context

# Check out class views
def upload(request):
    """
    Serves the upload template, provides professors as context
    """
    professors = Professor.objects.all()
    context = { "professors": professors }
    return render(request, 'tests/upload.html', context)
       