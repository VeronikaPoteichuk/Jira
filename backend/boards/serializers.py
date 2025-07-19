from rest_framework import serializers
from .models import Board, Column, Task, Comment, TaskHistory


class TaskWriteSerializer(serializers.ModelSerializer):
    author = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = Task
        exclude = ("id_in_board",)


class TaskHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskHistory
        fields = "__all__"


class TaskReadSerializer(serializers.ModelSerializer):
    column = serializers.SerializerMethodField()
    author_username = serializers.CharField(source="author.username", read_only=True)
    board_name = serializers.SerializerMethodField()
    key = serializers.SerializerMethodField()
    history = TaskHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = "__all__"

    def get_column(self, obj):
        return {"id": obj.column.id, "name": obj.column.name} if obj.column else None

    def get_board_name(self, obj):
        try:
            return obj.column.board.name
        except AttributeError:
            return None

    def get_key(self, obj):
        try:
            return f"{obj.column.board.name}-{obj.id_in_board}"
        except AttributeError:
            return f"undefined-{obj.id_in_board}"


class ColumnSerializer(serializers.ModelSerializer):
    tasks = TaskReadSerializer(many=True, read_only=True)

    class Meta:
        model = Column
        fields = "__all__"


class BoardSerializer(serializers.ModelSerializer):
    columns = ColumnSerializer(many=True, read_only=True)
    task_count = serializers.SerializerMethodField()
    github_repo = serializers.CharField(source="project.github_repo", read_only=True)

    class Meta:
        model = Board
        exclude = ["created_by"]

    def get_task_count(self, obj):
        return Task.objects.filter(column__board=obj).count()


class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "text", "task", "author_username", "created_at"]
        read_only_fields = ["created_at", "author_username", "task"]
