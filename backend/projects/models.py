from django.db import models
from django.conf import settings
import hashlib
from cryptography.fernet import Fernet, InvalidToken
import base64
import os

FERNET_KEY = os.environ.get("FERNET_KEY")
if not FERNET_KEY:
    FERNET_KEY = base64.urlsafe_b64encode(os.urandom(32)).decode()
fernet = Fernet(FERNET_KEY.encode())


class Project(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    github_repo = models.CharField(max_length=255, blank=True, null=True)
    github_token = models.CharField(max_length=255, blank=True, null=True)
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name="projects", blank=True
    )
    github_token_hashed = models.CharField(max_length=64, blank=True, null=True)

    def set_github_token(self, token: str):
        encrypted = fernet.encrypt(token.encode()).decode()
        self.github_token = encrypted
        self.github_token_hashed = hashlib.sha256(token.encode()).hexdigest()

    def get_github_token(self):
        if not self.github_token:
            return None
        try:
            return fernet.decrypt(self.github_token.encode()).decode()
        except InvalidToken:
            return None

    def has_token(self):
        return bool(self.github_token_hashed)

    def __str__(self):
        return f"Project: {self.name}"
