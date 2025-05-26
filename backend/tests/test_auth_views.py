import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from unittest.mock import patch

User = get_user_model()


@pytest.mark.django_db
def test_login_view(client):
    user = User.objects.create_user(username="testuser", password="testpass123")
    response = client.post(
        reverse("token_obtain_pair"),
        {"username": user.username, "password": "testpass123"},
    )
    assert response.status_code == status.HTTP_200_OK
    assert "access" in response.data
    assert "refresh" in response.data
    assert response.data["user"]["username"] == user.username


@pytest.mark.django_db
def test_login_view_invalid_credentials(client):
    response = client.post(
        reverse("token_obtain_pair"),
        {"username": "wrongusername", "password": "wrongpass"},
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
def test_logout_view(client):
    user = User.objects.create_user(
        username="testuser", email="test@example.com", password="testpass123"
    )
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)
    client = APIClient()

    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    response = client.post(reverse("token_logout"), {"refresh": str(refresh)})
    assert response.status_code == status.HTTP_205_RESET_CONTENT


@pytest.mark.django_db
def test_logout_view_invalid_token(client):
    user = User.objects.create_user(
        username="testuser", email="test@example.com", password="testpass123"
    )
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)
    client = APIClient()

    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    response = client.post(reverse("token_logout"), {"refresh": "invalidtoken"})
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
@patch("requests.get")
def test_google_auth_view_success(mock_get, client):
    mock_response_data = {"email": "googleuser@example.com", "name": "Google User"}
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = mock_response_data

    response = client.post(reverse("google_auth"), {"access_token": "validtoken"})
    assert response.status_code == 200
    assert "access" in response.data
    assert "refresh" in response.data
    assert response.data["user"]["email"] == "googleuser@example.com"


@pytest.mark.django_db
@patch("requests.get")
def test_google_auth_view_invalid_token(mock_get, client):
    mock_get.return_value.status_code = 401

    response = client.post(reverse("google_auth"), {"access_token": "invalidtoken"})
    assert response.status_code == 400
    assert response.data["detail"] == "Invalid Google token."


@pytest.mark.django_db
def test_google_auth_view_missing_token(client):
    response = client.post(reverse("google_auth"), {})
    assert response.status_code == 400
    assert response.data["detail"] == "Access token is required."
