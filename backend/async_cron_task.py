import os
import django
import asyncio
import threading

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "jira.settings")
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()


async def run():
    async for user in User.objects.all().aiterator():
        print(user.username)


def start_asyncio_loop():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(run())


if __name__ == "__main__":
    thread = threading.Thread(target=start_asyncio_loop, daemon=True)
    thread.start()
    thread.join()
