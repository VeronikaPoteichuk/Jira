import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from users.views import AsyncUserViewSet

User = get_user_model()


@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
class TestAsyncUserViewSet:

    async def create_user(self, **kwargs):
        return await User.objects.acreate(**kwargs)

    def setup_method(self):
        self.factory = APIRequestFactory()

    async def test_list_users(self):

        await self.create_user(
            username="user1", email="user1@example.com", password="pass"
        )
        await self.create_user(
            username="user2", email="user2@example.com", password="pass"
        )

        view = AsyncUserViewSet.as_view({"get": "list"})
        request = self.factory.get("/users/")
        response = await view(request)

        assert response.status_code == 200
        assert len(response.data) == 2

    async def test_list_users_empty(self):
        view = AsyncUserViewSet.as_view({"get": "list"})
        request = self.factory.get("/users/")
        response = await view(request)

        assert response.status_code == 200
        assert len(response.data) == 0

    async def test_list_users_invalid_id(self):
        view = AsyncUserViewSet.as_view({"get": "retrieve"})
        request = self.factory.get("/users/invalid_id/")
        response = await view(request, pk="invalid_id")

        assert response.status_code == 404
        assert response.data["detail"] == "Not found."

    async def test_list_users_not_found(self):
        view = AsyncUserViewSet.as_view({"get": "retrieve"})
        request = self.factory.get("/users/9999/")
        response = await view(request, pk=9999)

        assert response.status_code == 404
        assert response.data["detail"] == "No User matches the given query."

    async def test_retrieve_user(self):
        user = await self.create_user(
            username="user1", email="user1@example.com", password="pass"
        )

        view = AsyncUserViewSet.as_view({"get": "retrieve"})
        request = self.factory.get(f"/users/{user.pk}/")
        response = await view(request, pk=user.pk)

        assert response.status_code == 200
        assert response.data["username"] == "user1"
        assert response.data["email"] == "user1@example.com"
        assert response.data["id"] == user.pk

    async def test_retrieve_user_not_found(self):
        view = AsyncUserViewSet.as_view({"get": "retrieve"})
        request = self.factory.get("/users/9999/")
        response = await view(request, pk=9999)

        assert response.status_code == 404
        assert response.data["detail"] == "No User matches the given query."

    async def test_retrieve_user_invalid_id(self):
        view = AsyncUserViewSet.as_view({"get": "retrieve"})
        request = self.factory.get("/users/invalid_id/")
        response = await view(request, pk="invalid_id")

        assert response.status_code == 404
        assert response.data["detail"] == "Not found."

    async def test_create_user(self):
        view = AsyncUserViewSet.as_view({"post": "create"})
        request = self.factory.post(
            "/users/",
            {"username": "user1", "email": "user1@example.com", "password": "password"},
            format="json",
        )
        response = await view(request)

        assert response.status_code == 201
        assert response.data["username"] == "user1"

    async def test_create_user_blank_username(self):
        view = AsyncUserViewSet.as_view({"post": "create"})
        request = self.factory.post(
            "/users/",
            {"username": "", "email": "user1@example.com", "password": "pass"},
            format="json",
        )
        response = await view(request)
        assert response.status_code == 400
        assert "This field may not be blank." in response.data["username"]

    async def test_create_user_plank_password(self):
        view = AsyncUserViewSet.as_view({"post": "create"})
        request = self.factory.post(
            "/users/",
            {"username": "user1", "email": "email@example.com", "password": ""},
            format="json",
        )
        response = await view(request)
        assert response.status_code == 400
        assert "This field may not be blank." in response.data["password"]

    async def test_create_user_invalid_email(self):
        view = AsyncUserViewSet.as_view({"post": "create"})
        request = self.factory.post(
            "/users/",
            {"username": "user1", "email": "invalid_email", "password": "pass"},
            format="json",
        )
        response = await view(request)
        assert response.status_code == 400
        assert "Enter a valid email address." in response.data["email"]

    async def test_update_user(self):
        user = await self.create_user(
            username="user1", email="user1@example.com", password="pass"
        )

        view = AsyncUserViewSet.as_view({"put": "update"})
        request = self.factory.put(
            f"/users/{user.pk}/",
            {
                "username": "user2",
                "email": "user2@example.com",
                "password": "password2",
            },
            format="json",
        )
        response = await view(request, pk=user.pk)

        assert response.status_code == 200
        assert response.data["username"] == "user2"

    async def test_update_user_not_found(self):
        view = AsyncUserViewSet.as_view({"put": "update"})
        request = self.factory.put(
            "/users/9999/",
            {
                "username": "user9999",
                "email": "user9999@example.com",
                "password": "pass9999",
            },
            format="json",
        )
        response = await view(request, pk=9999)
        assert response.status_code == 404
        assert response.data["detail"] == "No User matches the given query."

    async def test_update_user_invalid_id(self):
        view = AsyncUserViewSet.as_view({"put": "update"})
        request = self.factory.put(
            "/users/invalid_id/",
            {"username": "user2", "email": "user2@example.com", "password": "pass2"},
            format="json",
        )
        response = await view(request, pk="invalid_id")
        assert response.status_code == 404
        assert response.data["detail"] == "Not found."

    async def test_update_user_blank_username(self):
        user = await self.create_user(
            username="user1", email="dff@jdf.dd", password="pass"
        )
        view = AsyncUserViewSet.as_view({"put": "update"})
        request = self.factory.put(
            f"/users/{user.pk}/",
            {"username": "", "email": "ddfd@ddf.ssd", "password": "pass"},
            format="json",
        )
        response = await view(request, pk=user.pk)
        assert response.status_code == 400
        assert "This field may not be blank." in response.data["username"]

    async def test_update_user_blank_password(self):
        user = await self.create_user(
            username="user1", email="jfj@hdhd.dd", password="pass"
        )
        view = AsyncUserViewSet.as_view({"put": "update"})
        request = self.factory.put(
            f"/users/{user.pk}/",
            {"username": "user2", "email": "gggg@kff.dd", "password": ""},
            format="json",
        )
        response = await view(request, pk=user.pk)
        assert response.status_code == 400
        assert "This field may not be blank." in response.data["password"]

    async def test_update_user_invalid_email(self):
        user = await self.create_user(
            username="user1", email="user1@example.com", password="pass"
        )
        view = AsyncUserViewSet.as_view({"put": "update"})
        request = self.factory.put(
            f"/users/{user.pk}/",
            {"username": "user2", "email": "invalid_email", "password": "pass"},
            format="json",
        )
        response = await view(request, pk=user.pk)
        assert response.status_code == 400
        assert "Enter a valid email address." in response.data["email"]

    async def test_partial_update_user_name(self):
        user = await self.create_user(
            username="user1", email="user1@example.com", password="pass"
        )

        view = AsyncUserViewSet.as_view({"patch": "update"})
        request = self.factory.patch(
            f"/users/{user.pk}/", {"username": "user2"}, format="json"
        )
        response = await view(request, pk=user.pk)

        assert response.status_code == 200
        assert response.data["username"] == "user2"

    async def test_partial_update_user_email(self):
        user = await self.create_user(
            username="user1", email="user1@example.com", password="pass"
        )

        view = AsyncUserViewSet.as_view({"patch": "update"})
        request = self.factory.patch(
            f"/users/{user.pk}/", {"email": "user1update@example.com"}, format="json"
        )
        response = await view(request, pk=user.pk)

        assert response.status_code == 200
        assert response.data["email"] == "user1update@example.com"

    async def test_partial_update_user_password(self):
        user = await User.objects.acreate(
            username="user1", email="user1@example.com", password="pass"
        )

        view = AsyncUserViewSet.as_view({"patch": "update"})
        request = self.factory.patch(
            f"/users/{user.pk}/", {"password": "password2"}, format="json"
        )
        response = await view(request, pk=user.pk)

        assert response.status_code == 200

        user = await User.objects.aget(pk=user.pk)
        assert user.check_password("password2")

    async def test_delete_user(self):
        user = await self.create_user(
            username="user1", email="user1@example.com", password="pass"
        )

        view = AsyncUserViewSet.as_view({"delete": "destroy"})
        request = self.factory.delete(f"/users/{user.pk}/")
        response = await view(request, pk=user.pk)

        assert response.status_code == 204
        assert not await User.objects.filter(pk=user.pk).aexists()

    async def test_destroy_user_not_found(self):
        view = AsyncUserViewSet.as_view({"delete": "destroy"})
        request = self.factory.delete("/users/9999/")
        response = await view(request, pk=9999)

        assert response.status_code == 404
        assert response.data["detail"] == "No User matches the given query."

    async def test_destroy_user_invalid_id(self):
        view = AsyncUserViewSet.as_view({"delete": "destroy"})
        request = self.factory.delete("/users/invalid_id/")
        response = await view(request, pk="invalid_id")

        assert response.status_code == 404
        assert response.data["detail"] == "Not found."
