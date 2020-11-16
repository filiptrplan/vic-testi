from django.contrib import admin
from .models import Test, Subject, Professor, TestImage

# Register your models here.
admin.site.register(Test)
admin.site.register(Subject)
admin.site.register(Professor)
admin.site.register(TestImage)
