import pytest
import json
from unittest.mock import patch, MagicMock
from django.test import RequestFactory
from django.contrib.auth import get_user_model
from django.http import JsonResponse, HttpResponseRedirect
from django.conf import settings
from rest_framework.test import APIRequestFactory, force_authenticate
from rest_framework import status
from projects.github_auth import (
    GitHubLoginView,
    GitHubCallbackView,
    ValidateGitHubRepoAccessView,
    github_user_info,
)
from projects.models import Project

User = get_user_model()


@pytest.mark.django_db
class TestGitHubLoginView:

    def setup_method(self):
        self.factory = RequestFactory()

        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

    def test_github_login_view_get(self):
        view = GitHubLoginView()
        request = self.factory.get("/github/login/")
        response = view.get(request)

        assert isinstance(response, HttpResponseRedirect)

        assert "github.com/login/oauth/authorize" in response.url
        assert f"client_id={settings.GITHUB_CLIENT_ID}" in response.url
        assert "scope=repo" in response.url


@pytest.mark.django_db
class TestGitHubCallbackView:

    def setup_method(self):
        self.factory = RequestFactory()

        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

    @patch("projects.github_auth.requests.post")
    def test_github_callback_success(self, mock_post):
        mock_response = MagicMock()
        mock_response.json.return_value = {"access_token": "test_token_123"}
        mock_post.return_value = mock_response

        view = GitHubCallbackView()

        request = self.factory.get("/github/callback/?code=test_code")
        request.session = {}
        response = view.get(request)

        assert isinstance(response, HttpResponseRedirect)
        assert "localhost:3000/github-success" in response.url
        assert request.session.get("github_token") == "test_token_123"

        mock_post.assert_called_once_with(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": "test_code",
                "redirect_uri": settings.GITHUB_REDIRECT_URI,
            },
            timeout=5,
        )

    def test_github_callback_missing_code(self):
        view = GitHubCallbackView()
        request = self.factory.get("/github/callback/")
        response = view.get(request)

        assert isinstance(response, JsonResponse)
        assert response.status_code == 400

        content = json.loads(response.content.decode())

        assert content["error"] == "Missing code"

    @patch("projects.github_auth.requests.post")
    def test_github_callback_no_token(self, mock_post):
        mock_response = MagicMock()
        mock_response.json.return_value = {"error": "invalid_code"}
        mock_post.return_value = mock_response

        view = GitHubCallbackView()

        request = self.factory.get("/github/callback/?code=test_code")
        request.session = {}
        response = view.get(request)

        assert isinstance(response, JsonResponse)
        assert response.status_code == 400

        content = json.loads(response.content.decode())

        assert content["error"] == "Failed to get token"

    @patch("projects.github_auth.requests.post")
    def test_github_callback_request_exception(self, mock_post):
        mock_post.side_effect = Exception("Network error")

        view = GitHubCallbackView()

        request = self.factory.get("/github/callback/?code=test_code")
        request.session = {}

        with pytest.raises(Exception):
            view.get(request)


@pytest.mark.django_db
class TestValidateGitHubRepoAccessView:

    def setup_method(self):
        self.factory = APIRequestFactory()

        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

        self.project = Project.objects.create(
            name="Test Project", description="Test Description", created_by=self.user
        )

    def test_validate_repo_access_no_repo(self):
        view = ValidateGitHubRepoAccessView.as_view()
        request = self.factory.post("/validate-repo/", {}, format="json")
        force_authenticate(request, user=self.user)
        response = view(request)

        assert response.status_code == 400
        assert response.data["error"] == "Repo not specified"

    def test_validate_repo_access_no_token(self):
        view = ValidateGitHubRepoAccessView()
        request = self.factory.post(
            "/validate-repo/", {"repo": "owner/repo"}, format="json"
        )
        request.session = {}
        request.user = self.user
        request.data = {"repo": "owner/repo"}
        request.query_params = {}
        response = view.post(request)

        assert response.status_code == 403
        assert response.data["error"] == "Token not found"

    def test_validate_repo_access_unauthorized(self):
        view = ValidateGitHubRepoAccessView.as_view()
        request = self.factory.post(
            "/validate-repo/", {"repo": "owner/repo"}, format="json"
        )
        response = view(request)

        assert response.status_code == 401


@pytest.mark.django_db
class TestGitHubUserInfo:

    def setup_method(self):
        self.factory = APIRequestFactory()

        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

    def test_github_user_info_no_token(self):
        request = self.factory.get("/github/user-info/")
        request.session = {}
        response = github_user_info(request)

        assert response.status_code == 401
        assert (
            response.data["detail"] == "Authentication credentials were not provided."
        )


@pytest.mark.django_db
class TestGitHubAuthIntegration:

    def setup_method(self):
        self.factory = APIRequestFactory()

        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

        self.project = Project.objects.create(
            name="Test Project", description="Test Description", created_by=self.user
        )

    def test_github_auth_with_project_token(self):
        self.project.set_github_token("project_token_123")
        self.project.save()
        assert self.project.has_token() is True
        assert self.project.get_github_token() == "project_token_123"

    @patch("projects.github_auth.requests.post")
    def test_github_callback_integration(self, mock_post):
        mock_response = MagicMock()
        mock_response.json.return_value = {"access_token": "test_token_123"}
        mock_post.return_value = mock_response

        callback_view = GitHubCallbackView()
        callback_request = RequestFactory().get("/github/callback/?code=test_code")
        callback_request.session = {}
        callback_response = callback_view.get(callback_request)

        assert isinstance(callback_response, HttpResponseRedirect)
        assert callback_request.session.get("github_token") == "test_token_123"

    def test_project_token_encryption(self):
        self.project.set_github_token("test_token_123")
        self.project.save()

        assert self.project.github_token != "test_token_123"
        assert self.project.github_token_hashed is not None

        retrieved_token = self.project.get_github_token()

        assert retrieved_token == "test_token_123"
        assert self.project.has_token() is True

    def test_project_token_validation(self):
        assert self.project.has_token() is False
        assert self.project.get_github_token() is None

        self.project.set_github_token("test_token_123")
        self.project.save()

        assert self.project.has_token() is True
        assert self.project.get_github_token() == "test_token_123"

    def test_github_auth_url_generation(self):
        view = GitHubLoginView()
        request = RequestFactory().get("/github/login/")
        response = view.get(request)

        assert "github.com/login/oauth/authorize" in response.url
        assert f"client_id={settings.GITHUB_CLIENT_ID}" in response.url

        assert "scope=repo" in response.url
        assert response.url.startswith("https://")

    def test_github_callback_error_handling(self):
        view = GitHubCallbackView()
        request = RequestFactory().get("/github/callback/")
        response = view.get(request)

        assert isinstance(response, JsonResponse)
        assert response.status_code == 400

        content = json.loads(response.content.decode())

        assert content["error"] == "Missing code"

    def test_validate_repo_access_permissions(self):
        view = ValidateGitHubRepoAccessView.as_view()
        request = self.factory.post(
            "/validate-repo/", {"repo": "owner/repo"}, format="json"
        )
        response = view(request)

        assert response.status_code == 401

        view_direct = ValidateGitHubRepoAccessView()

        request2 = self.factory.post(
            "/validate-repo/", {"repo": "owner/repo"}, format="json"
        )
        request2.session = {}
        request2.user = self.user
        request2.data = {"repo": "owner/repo"}
        request2.query_params = {}
        response2 = view_direct.post(request2)

        assert response2.status_code == 403

    def test_github_user_info_permissions(self):
        request = self.factory.get("/github/user-info/")
        request.session = {}
        response = github_user_info(request)

        assert response.status_code == 401
        assert (
            response.data["detail"] == "Authentication credentials were not provided."
        )
