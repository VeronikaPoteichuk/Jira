from django.contrib.auth import get_user_model
from adrf.viewsets import ViewSet
from rest_framework.response import Response
from .serializers import UserSerializer
from swagger.async_user_view import swagger_user

User = get_user_model()


class AsyncUserViewSet(ViewSet):

    @swagger_user
    async def list(self, request):
        users_queryset = User.objects.all()
        users = [user async for user in users_queryset]
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
