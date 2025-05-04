from django.contrib.auth import get_user_model
from adrf.viewsets import ModelViewSet
from .serializers import UserSerializer, UserCreateSerializer, UserUpdateSerializer
from rest_framework.response import Response
from rest_framework import status
from asgiref.sync import sync_to_async
from rest_framework.exceptions import NotFound

User = get_user_model()


class AsyncUserViewSet(ModelViewSet):
    queryset = User.objects.all()

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        elif self.action == "update" or self.action == "partial_update":
            return UserUpdateSerializer
        return UserSerializer

    async def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        await sync_to_async(serializer.is_valid, thread_sensitive=True)(
            raise_exception=True
        )
        user = await sync_to_async(serializer.save, thread_sensitive=True)()
        read_serializer = UserSerializer(user)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)

    async def update(self, request, *args, **kwargs):
        instance = await sync_to_async(self.get_object, thread_sensitive=True)()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        await sync_to_async(serializer.is_valid, thread_sensitive=True)(
            raise_exception=True
        )
        updated_user = await sync_to_async(serializer.save, thread_sensitive=True)()
        return Response(UserUpdateSerializer(updated_user).data)

    async def destroy(self, request, *args, **kwargs):
        try:
            instance = await sync_to_async(self.get_object, thread_sensitive=True)()
        except User.DoesNotExist:
            raise NotFound("User not found.")
        await sync_to_async(instance.delete, thread_sensitive=True)()
        return Response(status=status.HTTP_204_NO_CONTENT)
