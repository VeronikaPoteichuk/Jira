import pytest
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def test_users():
    User.objects.create_user(username="user1", password="test123")
    User.objects.create_user(username="user2", password="test456")
    return User.objects.all()


@pytest.mark.django_db
def test_async_user_view_returns_users(api_client, test_users):
    url = reverse("async-user-list")
    response = api_client.get(url)

    assert response.status_code == 200
    data = response.json()
    assert "users" in data
    assert len(data["users"]) == 2
    assert {"id": 1, "username": "user1"} in data["users"]
    assert {"id": 2, "username": "user2"} in data["users"]


@pytest.mark.django_db
def test_async_user_view_empty_db(api_client):
    url = reverse("async-user-list")
    response = api_client.get(url)

    assert response.status_code == 200
    assert response.json() == {"users": []}


@pytest.mark.django_db
def test_async_user_view_structure(api_client, test_users):
    response = api_client.get(reverse("async-user-list"))
    data = response.json()

    assert isinstance(data, dict)
    assert isinstance(data["users"], list)
    assert all("id" in user and "username" in user for user in data["users"])


@pytest.mark.django_db
def test_async_user_view_content_type(api_client, test_users):
    response = api_client.get(reverse("async-user-list"))
    assert response["Content-Type"] == "application/json"
