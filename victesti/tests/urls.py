from django.urls import path

from . import views

urlpatterns = [
    path('search', views.search, name='tests.search'),
    path('upload', views.upload, name='tests.upload')
]