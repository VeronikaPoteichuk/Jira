from django.contrib.auth import get_user_model
from adrf.viewsets import ModelViewSet
from rest_framework.response import Response
from .serializers import UserSerializer
from swagger.swagger_async_user_view import swagger_user

User = get_user_model()


@swagger_user
class AsyncUserViewSet(ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()
