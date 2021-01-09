from django.urls import path
from django.views.generic import TemplateView

from . import views

urlpatterns = [
    path('', TemplateView.as_view(template_name="main/index.html"), name='main.home'),
    path('api/login', views.fb_login, name='main.api.login')
]