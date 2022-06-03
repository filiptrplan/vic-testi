from django.db import models
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, fb_id, name, creation_ip):
        user = User(fb_id=fb_id, name=name, creation_ip=creation_ip)
        user.save()
        return user

    def create_superuser(self, fb_id, name, password, creation_ip):
        user = User(fb_id=fb_id, name=name, creation_ip=creation_ip, is_admin=True)
        user.set_password(password)
        user.save()
        return user

class User(AbstractBaseUser):
    fb_id = models.CharField(max_length=100, unique=True, verbose_name='Facebook ID')
    name = models.CharField(max_length=100, default='')
    creation_ip = models.CharField(max_length=100, default='0.0.0.0')
    last_login_ip = models.CharField(max_length=100, null=True, default='0.0.0.0')
    is_admin = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    # This is only for superusers
    password = models.CharField(max_length=100, null=True)

    objects = UserManager()

    USERNAME_FIELD = 'fb_id'
    REQUIRED_FIELDS = ['creation_ip', 'name']

    @property
    def is_staff(self):
        return self.is_admin

    def __str__(self):
        return self.name

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True
