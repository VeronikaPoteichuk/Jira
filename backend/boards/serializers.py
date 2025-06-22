from rest_framework import serializers
from .models import Board, Column, Task, Comment


class TaskWriteSerializer(serializers.ModelSerializer):
    author = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Task
        fields = "__all__"


class TaskReadSerializer(serializers.ModelSerializer):
    column = serializers.SerializerMethodField()
    author_username = serializers.CharField(source="author.username", read_only=True)
    project_name = serializers.SerializerMethodField()
    key = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = "__all__"

    def get_column(self, obj):
        return {"id": obj.column.id, "name": obj.column.name} if obj.column else None

    def get_project_name(self, obj):
        try:
            return obj.column.board.project.name
        except AttributeError:
            return None

    def get_key(self, obj):
        try:
            return f"{obj.column.board.project.name}-{obj.id}"
        except AttributeError:
            return f"undefined-{obj.id}"


class ColumnSerializer(serializers.ModelSerializer):
    tasks = TaskReadSerializer(many=True, read_only=True)

    class Meta:
        model = Column
        fields = "__all__"


class BoardSerializer(serializers.ModelSerializer):
    columns = ColumnSerializer(many=True, read_only=True)

    class Meta:
        model = Board
        fields = "__all__"


class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "text", "task", "author_username", "created_at"]
        read_only_fields = ["created_at", "author_username", "task"]
