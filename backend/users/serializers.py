from adrf.serializers import Serializer
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.validators import validate_email
from django.core.exceptions import ValidationError


User = get_user_model()


class UserSerializer(Serializer):
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    date_joined = serializers.DateTimeField(read_only=True)
    last_login = serializers.DateTimeField(read_only=True)

    def validate_username(self, value):
        if len(value) > 150:
            raise serializers.ValidationError(
                "Username cannot be longer than 150 characters."
            )
        return value

    def validate_email(self, value):
        if value:
            try:
                validate_email(value)
            except ValidationError:
                raise serializers.ValidationError("Enter a valid email address.")
        return value


class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email", "first_name", "last_name", "password"]
        extra_kwargs = {
            "password": {
                "write_only": True,
                "min_length": 8,
                "error_messages": {
                    "min_length": "Password must be at least 8 characters long."
                },
            },
            "username": {
                "max_length": 150,
                "error_messages": {
                    "max_length": "Username cannot be longer than 150 characters."
                },
            },
            "first_name": {
                "max_length": 150,
                "required": False,
                "allow_blank": True,
                "error_messages": {
                    "max_length": "First name cannot be longer than 150 characters."
                },
            },
            "last_name": {
                "max_length": 150,
                "required": False,
                "allow_blank": True,
                "error_messages": {
                    "max_length": "Last name cannot be longer than 150 characters."
                },
            },
        }

    def validate_email(self, value):
        if value:
            try:
                validate_email(value)
            except ValidationError:
                raise serializers.ValidationError("Enter a valid email address.")
        return value

    def validate_first_name(self, value):
        if value and len(value) > 150:
            raise serializers.ValidationError(
                "First name cannot be longer than 150 characters."
            )
        return value

    def validate_last_name(self, value):
        if value and len(value) > 150:
            raise serializers.ValidationError(
                "Last name cannot be longer than 150 characters."
            )
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "password")
        extra_kwargs = {
            "password": {
                "write_only": True,
                "required": False,
                "min_length": 8,
                "error_messages": {
                    "min_length": "Password must be at least 8 characters long."
                },
            },
            "username": {
                "max_length": 150,
                "error_messages": {
                    "max_length": "Username cannot be longer than 150 characters."
                },
            },
            "first_name": {
                "max_length": 150,
                "required": False,
                "allow_blank": True,
                "error_messages": {
                    "max_length": "First name cannot be longer than 150 characters."
                },
            },
            "last_name": {
                "max_length": 150,
                "required": False,
                "allow_blank": True,
                "error_messages": {
                    "max_length": "Last name cannot be longer than 150 characters."
                },
            },
        }

    def validate_email(self, value):
        if value:
            try:
                validate_email(value)
                if (
                    User.objects.exclude(pk=self.instance.pk)
                    .filter(email=value)
                    .exists()
                ):
                    raise serializers.ValidationError(
                        "A user with that email already exists."
                    )
            except ValidationError:
                raise serializers.ValidationError("Enter a valid email address.")
        return value

    def validate_first_name(self, value):
        if value and len(value) > 150:
            raise serializers.ValidationError(
                "First name cannot be longer than 150 characters."
            )
        return value

    def validate_last_name(self, value):
        if value and len(value) > 150:
            raise serializers.ValidationError(
                "Last name cannot be longer than 150 characters."
            )
        return value

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        instance = super().update(instance, validated_data)
        if password:
            instance.set_password(password)
            instance.save()
        return instance


from rest_framework import serializers


class GoogleAuthSerializer(serializers.Serializer):
    access_token = serializers.CharField()
