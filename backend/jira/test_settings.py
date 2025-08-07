"""
Test settings for Django project.
"""

from .settings import *

# SQLite for testing
DATABASES = {  # type: ignore
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
        "OPTIONS": {  # type: ignore
            "timeout": "20",
        },
    }
}

# Disable password hashing for faster tests
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

# In-memory channel layer for testing
CHANNEL_LAYERS = {"default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}}

# Set testing environment variable
import os

os.environ["DJANGO_TESTING"] = "True"
os.environ["FERNET_KEY"] = "pR6cv07HL-E518QhwMijqwLOfO0-qNC48ZCHMOgXriM="

ASGI_APPLICATION = None  # type: ignore
