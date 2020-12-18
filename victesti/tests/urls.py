from django.urls import path

from . import views
from . import api_views
from .views import TestDetailView

urlpatterns = [
    path('search', views.search, name='tests.search'),
    path('api/search', api_views.search, name='tests.api.search'),
    path('upload', api_views.upload, name='tests.api.upload'),
    path('get-signature', api_views.get_signature, name='tests.api.signature'),
    path('api/create', api_views.create_test, name='tests.api.create'),
    path('<int:pk>', TestDetailView.as_view(), name='tests.detail'),
    path('api/<int:pk>/links', api_views.test_links, name='tests.api.links'),
    path('api/<int:pk>/is-owner', api_views.test_is_owner, name='test.api.owner'),
    path('api/<int:pk>/delete', api_views.test_delete, name='test.api.delete'),
    path('api/<int:pk>', api_views.test, name='test.api')
]