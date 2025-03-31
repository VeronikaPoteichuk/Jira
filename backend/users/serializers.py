from adrf.serializers import Serializer
from rest_framework import serializers


class UserSerializer(Serializer):
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField()
    email = serializers.EmailField(required=False)
