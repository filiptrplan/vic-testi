from django.shortcuts import render
from django.http import JsonResponse
import requests
from .models import User
from django.contrib.auth import login, logout

# Create your views here.
def index(request):
    return render(request, 'main/index.html')

def api_login(request):
    api_token = request.POST.get('access_token')
    if api_token is None:
        return JsonResponse({'error': 'no_api_token'}, status=400)

    fb_response = requests.get('https://graph.facebook.com/me', params={
        'access_token': api_token,
        'fields': ['id','name']
    })
    if 'error' in fb_response.json():
        return JsonResponse({'error': 'invalid_fb_token'}, status=500)

    fb_user_id = fb_response.json()['id']
    ip = visitor_ip_address(request)
    try:
        user = User.objects.get(fb_id=fb_user_id)
    except User.DoesNotExist:
        name = fb_response.json()['name']
        user = User.objects.create_user(fb_user_id, name, ip)
    
    user.last_login_ip = ip
    user.save()

    login(request, user)
    return JsonResponse({'status': 'logged_in'})

def api_logout(request):
    logout(request)
    return JsonResponse({'status': 'logged_out'})

def visitor_ip_address(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip