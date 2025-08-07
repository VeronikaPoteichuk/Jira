import pytest
from django.contrib.auth import get_user_model
from users.serializers import UserSerializer, UserCreateSerializer, UserUpdateSerializer
from asgiref.sync import sync_to_async

User = get_user_model()


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_user_serializer():
    user = await User.objects.acreate(
        username="user1", email="user1@example.com", password="pass"
    )

    serializer = UserSerializer(instance=user)

    assert serializer.data["username"] == "user1"
    assert serializer.data["email"] == "user1@example.com"
    assert "id" in serializer.data
    assert "password" not in serializer.data


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_user_create_serializer_async():
    data = {"username": "user1", "email": "user1@example.com", "password": "password"}

    serializer = UserCreateSerializer(data=data)
    is_valid = await sync_to_async(serializer.is_valid)()
    assert is_valid, serializer.errors

    user = await sync_to_async(serializer.save)()
    assert user.username == "user1"
    assert user.email == "user1@example.com"
    assert await sync_to_async(user.check_password)("password")
    assert user.password != "password"


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_user_update_serializer_with_password():
    user = await User.objects.acreate(
        username="user1", email="user1@example.com", password="pass"
    )

    data = {"username": "user2", "email": "user2@example.com", "password": "password2"}

    serializer = UserUpdateSerializer(instance=user, data=data)
    is_valid = await sync_to_async(serializer.is_valid)()
    assert is_valid, serializer.errors

    updated_user = await sync_to_async(serializer.save)()
    assert updated_user.username == "user2"
    assert updated_user.email == "user2@example.com"
    assert await sync_to_async(updated_user.check_password)("password2")
    assert not await sync_to_async(updated_user.check_password)("pass")


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_user_update_serializer_without_password():
    user = User(username="user1", email="user1@example.com")
    user.set_password("pass")
    await sync_to_async(user.save)()

    data = {"username": "user2", "email": "user2@example.com"}

    serializer = UserUpdateSerializer(instance=user, data=data)
    is_valid = await sync_to_async(serializer.is_valid)()
    assert is_valid, serializer.errors

    updated_user = await sync_to_async(serializer.save)()
    assert updated_user.username == "user2"
    assert updated_user.email == "user2@example.com"
    assert await sync_to_async(updated_user.check_password)("pass")


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_user_update_serializer_with_partial_update():
    user = User(username="user1", email="user1@example.com")
    user.set_password("pass")
    await sync_to_async(user.save)()

    data = {
        "username": "user2",
        "email": "user2@example.com",
    }

    serializer = UserUpdateSerializer(instance=user, data=data, partial=True)
    is_valid = await sync_to_async(serializer.is_valid)()
    assert is_valid, serializer.errors

    updated_user = await sync_to_async(serializer.save)()
    assert updated_user.username == "user2"
    assert updated_user.email == "user2@example.com"
    assert await sync_to_async(updated_user.check_password)("pass")


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_user_update_serializer_with_partial_update_and_password():
    user = User(username="user1", email="user1@example.com")
    user.set_password("pass")
    await sync_to_async(user.save)()

    data = {"username": "user2", "email": "user2@example.com", "password": "password2"}

    serializer = UserUpdateSerializer(instance=user, data=data, partial=True)
    is_valid = await sync_to_async(serializer.is_valid)()
    assert is_valid, serializer.errors

    updated_user = await sync_to_async(serializer.save)()
    assert updated_user.username == "user2"
    assert updated_user.email == "user2@example.com"
    assert await sync_to_async(updated_user.check_password)("password2")
    assert not await sync_to_async(updated_user.check_password)("pass")


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_user_update_serializer_change_username_and_password_but_keep_email():
    user = User(username="user1", email="user1@example.com")
    user.set_password("pass")
    await sync_to_async(user.save)()

    data = {"username": "user2", "email": "user1@example.com", "password": "password2"}

    serializer = UserUpdateSerializer(instance=user, data=data, partial=True)
    is_valid = await sync_to_async(serializer.is_valid)()
    assert is_valid, serializer.errors

    updated_user = await sync_to_async(serializer.save)()
    assert updated_user.username == "user2"
    assert updated_user.email == "user1@example.com"
    assert await sync_to_async(updated_user.check_password)("password2")
    assert not await sync_to_async(updated_user.check_password)("pass")


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_user_create_serializer_invalid_email():
    data = {"username": "user1", "email": "not-an-email", "password": "pass123"}

    serializer = UserCreateSerializer(data=data)
    is_valid = await sync_to_async(serializer.is_valid)()
    assert not is_valid
    assert "email" in serializer.errors


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_user_create_serializer_missing_fields():
    data = {"username": "user1"}

    serializer = UserCreateSerializer(data=data)
    is_valid = await sync_to_async(serializer.is_valid)()
    assert not is_valid
    assert "password" in serializer.errors


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_user_update_serializer_invalid_email():
    user = User(username="user1", email="user1@example.com")
    user.set_password("pass")
    await sync_to_async(user.save)()

    data = {"email": "bad-email"}

    serializer = UserUpdateSerializer(instance=user, data=data, partial=True)
    is_valid = await sync_to_async(serializer.is_valid)()
    assert not is_valid
    assert "email" in serializer.errors


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_user_update_serializer_username_too_short():
    user = User(username="user1", email="user1@example.com")
    user.set_password("pass")
    await sync_to_async(user.save)()

    data = {"username": ""}

    serializer = UserUpdateSerializer(instance=user, data=data, partial=True)
    is_valid = await sync_to_async(serializer.is_valid)()
    assert not is_valid
    assert "username" in serializer.errors


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_user_update_serializer_no_changes():
    user = User(username="user1", email="user1@example.com")
    user.set_password("pass")
    await sync_to_async(user.save)()

    data = {}

    serializer = UserUpdateSerializer(instance=user, data=data, partial=True)
    is_valid = await sync_to_async(serializer.is_valid)()
    assert is_valid, serializer.errors
    updated_user = await sync_to_async(serializer.save)()
    assert updated_user.username == "user1"
    assert updated_user.email == "user1@example.com"
    assert await sync_to_async(updated_user.check_password)("pass")


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_user_create_serializer_duplicate_username():
    await User.objects.acreate(
        username="user1", email="u1@example.com", password="pass"
    )

    data = {"username": "user1", "email": "u2@example.com", "password": "pass2"}

    serializer = UserCreateSerializer(data=data)
    is_valid = await sync_to_async(serializer.is_valid)()
    assert not is_valid
    assert "username" in serializer.errors


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_user_update_serializer_empty_password():
    user = await User.objects.acreate(
        username="user1", email="user1@example.com", password="pass"
    )
    data = {"password": ""}
    serializer = UserUpdateSerializer(instance=user, data=data, partial=True)
    is_valid = await sync_to_async(serializer.is_valid)()
    assert not is_valid
    assert "password" in serializer.errors


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_user_serializer_with_missing_email():
    user = await User.objects.acreate(username="user1", password="pass")

    serializer = UserSerializer(instance=user)

    assert serializer.data["username"] == "user1"
    assert serializer.data["email"] == ""
    assert "id" in serializer.data


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_user_create_serializer_without_email():
    data = {"username": "user1", "password": "password1"}

    serializer = UserCreateSerializer(data=data)
    is_valid = await sync_to_async(serializer.is_valid)()
    assert is_valid, serializer.errors

    user = await sync_to_async(serializer.save)()
    assert user.username == "user1"
    assert user.email == ""
    assert await sync_to_async(user.check_password)("password1")


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_user_update_serializer_password_only():
    user = await User.objects.acreate(
        username="user1", email="user1@example.com", password="oldpass"
    )

    data = {"password": "password2"}

    serializer = UserUpdateSerializer(instance=user, data=data, partial=True)
    is_valid = await sync_to_async(serializer.is_valid)()
    assert is_valid, serializer.errors

    updated_user = await sync_to_async(serializer.save)()
    assert updated_user.username == "user1"
    assert updated_user.email == "user1@example.com"
    assert await sync_to_async(updated_user.check_password)("password2")


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_user_update_serializer_duplicate_email():
    await User.objects.acreate(
        username="user1", email="user1@example.com", password="pass"
    )
    user2 = await User.objects.acreate(
        username="user2", email="user2@example.com", password="pass2"
    )

    data = {"email": "user1@example.com"}

    serializer = UserUpdateSerializer(instance=user2, data=data, partial=True)
    is_valid = await sync_to_async(serializer.is_valid)()
    assert not is_valid
    assert "email" in serializer.errors


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_user_serializer_data_validation():
    invalid_data = [
        {"username": "", "email": "test@example.com"},
        {"username": "user", "email": "not-an-email"},
        {"username": "a" * 151, "email": "test@example.com"},
    ]

    for data in invalid_data:
        serializer = UserSerializer(data=data)
        is_valid = await sync_to_async(serializer.is_valid)()
        assert not is_valid, f"The data must be invalid: {data}"


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_user_create_serializer_weak_password():
    data = {"username": "user1", "email": "user1@example.com", "password": "1"}

    serializer = UserCreateSerializer(data=data)
    is_valid = await sync_to_async(serializer.is_valid)()
    assert not is_valid
    assert "password" in serializer.errors


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_user_update_serializer_readonly_id():
    user = await User.objects.acreate(
        username="user1", email="user1@example.com", password="pass"
    )

    original_id = user.id
    data = {"id": original_id + 100}

    serializer = UserUpdateSerializer(instance=user, data=data, partial=True)
    is_valid = await sync_to_async(serializer.is_valid)()
    assert is_valid, serializer.errors

    updated_user = await sync_to_async(serializer.save)()
    assert updated_user.id == original_id


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_user_serializer_to_representation():
    user = await User.objects.acreate(
        username="user1",
        email="user1@example.com",
        password="pass",
        first_name="John",
        last_name="Doe",
    )

    serializer = UserSerializer(instance=user)
    representation = serializer.data

    assert set(representation.keys()) == {"id", "username", "email"}
    assert representation["username"] == "user1"
    assert representation["email"] == "user1@example.com"


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_user_create_serializer_empty_data():
    serializer = UserCreateSerializer(data={})
    is_valid = await sync_to_async(serializer.is_valid)()
    assert not is_valid
    assert "username" in serializer.errors
    assert "password" in serializer.errors
