import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from asgiref.sync import sync_to_async

from users.views import AsyncUserViewSet

User = get_user_model()


@pytest.mark.django_db
@pytest.mark.asyncio
async def test_async_user_viewset_list():
    await sync_to_async(User.objects.create_user)(
        username="user1", password="testpass123"
    )
    await sync_to_async(User.objects.create_user)(
        username="user2", password="testpass123"
    )

    factory = APIRequestFactory()
    request = factory.get("/users/")

    viewset = AsyncUserViewSet()
    viewset.action_map = {"get": "list"}
    viewset.request = request

    response = await viewset.list(request)

    assert response.status_code == 200
    assert "users" in response.data
    assert len(response.data["users"]) == 2

    usernames = [user["username"] for user in response.data["users"]]
    assert "user1" in usernames
    assert "user2" in usernames

    users_data = response.data["users"]
    assert any(user["username"] == "user1" for user in users_data)
    assert any(user["username"] == "user2" for user in users_data)
