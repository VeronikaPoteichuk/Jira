import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from users.views import AsyncUserViewSet

User = get_user_model()


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_async_user_viewset():
    user1 = await User.objects.acreate(
        username="testuser1", email="user1@example.com", password="testpass123"
    )

    view = AsyncUserViewSet.as_view({"get": "list"})
    factory = APIRequestFactory()
    request = factory.get("/users/")

    response = await view(request)

    assert response.status_code == 200
    assert len(response.data) == 2

    usernames = {user["username"] for user in response.data}
    assert "testuser1" in usernames
    assert "testuser2" in usernames
    assert all(field in response.data[0] for field in ["id", "username", "email"])

    await User.objects.all().adelete()

    empty_request = factory.get("/users/")
    empty_response = await view(empty_request)

    assert empty_response.status_code == 200
    assert len(empty_response.data) == 0

    if len(response.data) > 0:
        first_user = response.data[0]
        assert isinstance(first_user["id"], int)
        assert isinstance(first_user["username"], str)
        assert isinstance(first_user["email"], str)
