from django.contrib.auth import get_user_model
from adrf.viewsets import ModelViewSet
from .serializers import UserSerializer

User = get_user_model()


class AsyncUserViewSet(ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()
