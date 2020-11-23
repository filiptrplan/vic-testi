from django.urls import path

from . import views
from .views import TestDetailView

urlpatterns = [
    path('search', views.search, name='tests.search'),
    path('upload', views.upload, name='tests.upload'),
    path('get-signature', views.get_signature, name='tests.signature'),
    path('create', views.create_test, name='tests.create'),
    path('<int:pk>', TestDetailView.as_view(), name='tests.detail')
]