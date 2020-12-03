from django.urls import path

from . import views
from .views import TestDetailView

urlpatterns = [
    path('search', views.search, name='tests.search'),
    path('search/ajax', views.search_ajax, name='tests.search.ajax'),
    path('upload', views.upload, name='tests.upload'),
    path('get-signature', views.get_signature, name='tests.signature'),
    path('create', views.create_test, name='tests.create'),
    path('<int:pk>', TestDetailView.as_view(), name='tests.detail'),
    path('<int:pk>/links', views.test_links, name='tests.links'),
    path('<int:pk>/is-owner', views.test_is_owner, name='test.owner'),
    path('<int:pk>/delete', views.test_delete, name='test.delete')
]