from django.shortcuts import render
from django.http import HttpResponse

def search(request):
    return 'search'

# Check out class views
def upload(request):
    context = {};
    return render(request, 'tests/upload.html', context)