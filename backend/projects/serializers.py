from rest_framework import serializers
from .models import Project
from .utils import validate_github_repo_access
from django.contrib.auth import get_user_model

User = get_user_model()


class ProjectSerializer(serializers.ModelSerializer):
    board_count = serializers.SerializerMethodField()
    members = serializers.SlugRelatedField(
        many=True, slug_field="email", queryset=User.objects.all(), required=False
    )

    class Meta:
        model = Project
        fields = [
            "id",
            "name",
            "description",
            "created_at",
            "board_count",
            "github_repo",
            "github_token",
            "members",
        ]
        read_only_fields = ["github_token"]

    def update(self, instance, validated_data):
        request = self.context.get("request")
        token = request.session.get("github_token")

        github_repo = validated_data.get("github_repo")
        if github_repo and token:
            has_access = validate_github_repo_access(token, github_repo)
            if not has_access:
                raise serializers.ValidationError("No access to GitHub repository")
            validated_data["github_token"] = token

        return super().update(instance, validated_data)

    def get_board_count(self, obj):
        return obj.boards.count()
