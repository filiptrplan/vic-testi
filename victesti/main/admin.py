from django import forms
from django.contrib import admin
from django.contrib.auth.models import Group
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django.core.exceptions import ValidationError
from .models import User

class UserCreationForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ('fb_id', 'name', 'creation_ip')

    def save(self, commit=True):
        # Save the provided password in hashed format
        user = super().save(commit=False)
        if commit:
            user.save()
        return user


class UserChangeForm(forms.ModelForm):
    """A form for updating users. Includes all the fields on
    the user, but replaces the password field with admin's
    password hash display field.
    """
    password = ReadOnlyPasswordHashField()

    class Meta:
        model = User
        fields = ('fb_id', 'name')


class UserAdmin(BaseUserAdmin):
    # The forms to add and change user instances
    form = UserChangeForm
    add_form = UserCreationForm

    list_display = ('fb_id', 'name', 'creation_ip', 'last_login_ip', 'created_at', 'is_admin')
    list_filter = ('is_admin',)
    fieldsets = (
        (None, {'fields': ('fb_id', 'name', 'creation_ip', 'last_login_ip', 'is_admin')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('fb_id', 'name'),
        }),
    )
    search_fields = ('fb_id',)
    ordering = ('fb_id',)
    filter_horizontal = ()

# Register your models here.
admin.site.register(User, UserAdmin)