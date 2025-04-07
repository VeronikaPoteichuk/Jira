from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Sync cron task"

    def handle(self, *args, **options):
        self.run_sync()

    def run_sync(self):
        for obj in User.objects.all():
            print(f"Name: {obj.username}", flush=True)
