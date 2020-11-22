from django.shortcuts import render
from django.http import HttpResponse
from tests.models import Professor
from django.http import JsonResponse
from django.conf import settings
import tests.upload
import json

def search(request):
    return 'search'

# Check out class views
def upload(request):
    professors = Professor.objects.all()
    context = { "professors": professors }
    return render(request, 'tests/upload.html', context)

def get_signature(request):
    file_name = request.POST['file_name']
    sig = tests.upload.generate_post_signature(settings.AWS_KEY_NAME, file_name)
    return JsonResponse(sig)