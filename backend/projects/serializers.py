from rest_framework import serializers
from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    board_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ["id", "name", "description", "created_at", "board_count"]

    def get_board_count(self, obj):
        return obj.boards.count()
