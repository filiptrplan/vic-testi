from django.shortcuts import render
from django.http import JsonResponse
from hashlib import sha256
import random
import requests
from django.contrib.auth import login, logout
from django.contrib.auth.models import User

# Create your views here.
def index(request):
    return render(request, 'main/index.html');

def fb_login(request):
    api_token = request.POST.get('fb_token')
    if api_token is None:
        return JsonResponse({'error': 'no_api_token'}, status=400)

    fb_response = requests.get('https://graph.facebook.com/me', params={
        'access_token': api_token,
        'fields': ['id','first_name','last_name']
    })
    if 'error' in fb_response.json():
        return JsonResponse({'error': 'invalid_fb_token'}, status=500)

    fb_data = fb_response.json()
    try:
        user = User.objects.get(username=fb_data['id'])
    except User.DoesNotExist:
        # Doesn't really matter what password we choose because we got the facebook api to handle the authentication for us
        random_password = ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(20))
        user = User(first_name=fb_data['first_name'], last_name=fb_data['last_name'], username=fb_data['id'], password=sha256(random_password))
        user.save()

    login(request, user)
    return JsonResponse({'status': 'logged_in'})
