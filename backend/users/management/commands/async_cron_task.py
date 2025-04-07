import asyncio
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Async cron task"

    def handle(self, *args, **options):
        asyncio.run(self.run_async())

    async def run_async(self):
        async for user in User.objects.all().aiterator():
            print(f"ID: {user.id}, Name: {user.username}", flush=True)
