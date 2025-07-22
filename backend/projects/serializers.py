from rest_framework import serializers
from .models import Project
from .utils import validate_github_repo_access
from django.contrib.auth import get_user_model

User = get_user_model()


class ProjectSerializer(serializers.ModelSerializer):
    board_count = serializers.SerializerMethodField()
    members = serializers.SlugRelatedField(
        many=True, slug_field="email", read_only=True
    )
    token = serializers.CharField(write_only=True, required=False)

    has_token = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "description",
            "created_at",
            "board_count",
            "github_repo",
            "members",
            "token",
            "has_token",
        ]
        read_only_fields = ["created_by", "github_token"]

    def get_has_token(self, obj):
        return obj.has_token()

    def update(self, instance, validated_data):
        request = self.context.get("request")
        token = request.session.get("github_token") or request.data.get("token")

        github_repo = validated_data.get("github_repo")
        if github_repo and token:
            has_access = validate_github_repo_access(token, github_repo)
            if not has_access:
                raise serializers.ValidationError("No access to GitHub repository")
            validated_data["github_token"] = token

        token = validated_data.pop("token", None)
        if token:
            instance.set_github_token(token)
        return super().update(instance, validated_data)

    def get_board_count(self, obj):
        return obj.boards.count()
