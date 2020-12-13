from django.core.management.base import BaseCommand
from django.conf import settings
from django.contrib.auth import get_user_model

class Command(BaseCommand):

    def handle(self, *args, **options):
        User = get_user_model()
        username = settings.ADMIN_USERNAME
        email = settings.ADMIN_EMAIL
        password = settings.ADMIN_PASSWORD
        User.objects.create_superuser(username, email, password)