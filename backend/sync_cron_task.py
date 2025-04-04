import os
import django
from django.contrib.auth import get_user_model

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "jira.settings")
django.setup()

User = get_user_model()


def run():
    for obj in User.objects.all():
        print(f"ID: {obj.id}, Name: {obj.username}")


if __name__ == "__main__":
    run()
