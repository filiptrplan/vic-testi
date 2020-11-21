from django.shortcuts import render
from django.http import HttpResponse
from tests.models import Professor
from .forms import S3DirectUploadForm

def search(request):
    return 'search'

# Check out class views
def upload(request):
    professors = Professor.objects.all()
    context = { "professors": professors };
    return render(request, 'tests/upload.html', context)