import pytest
from django.contrib.auth import get_user_model
from users.serializers import UserSerializer

User = get_user_model()


@pytest.mark.django_db
@pytest.mark.asyncio
async def test_user_serializer():
    user2 = await User.objects.acreate(
        username="testuser2", email="user2@example.com", password="testpass123"
    )

    serializer = UserSerializer(instance=user2)

    assert serializer.data["username"] == "testuser2"
    assert serializer.data["email"] == "user2@example.com"
    assert "id" in serializer.data
