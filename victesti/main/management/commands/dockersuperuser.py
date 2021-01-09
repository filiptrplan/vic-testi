from django.core.management.base import BaseCommand
from django.conf import settings
from main.models import User

class Command(BaseCommand):

    def handle(self, *args, **options):
        username = settings.ADMIN_USERNAME
        password = settings.ADMIN_PASSWORD
        User.objects.create_superuser(username, 'SUPERUSER', password, '127.0.0.1')