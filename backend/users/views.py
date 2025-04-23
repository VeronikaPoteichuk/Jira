from django.contrib.auth import get_user_model
from adrf.viewsets import ModelViewSet
from .serializers import UserSerializer, UserCreateSerializer
from rest_framework.response import Response
from rest_framework import status
from asgiref.sync import sync_to_async

User = get_user_model()


class AsyncUserViewSet(ModelViewSet):
    queryset = User.objects.all()

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        return UserSerializer

    async def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        await sync_to_async(serializer.is_valid, thread_sensitive=True)(
            raise_exception=True
        )
        user = await sync_to_async(serializer.save, thread_sensitive=True)()
        read_serializer = UserSerializer(user)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)
