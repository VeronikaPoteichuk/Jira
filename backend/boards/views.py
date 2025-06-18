from adrf.viewsets import ModelViewSet
from .models import Board, Column, Task, Comment
from .serializers import (
    BoardSerializer,
    ColumnSerializer,
    TaskSerializer,
    CommentSerializer,
)
from rest_framework.decorators import action
from rest_framework.response import Response


class BoardViewSet(ModelViewSet):
    serializer_class = BoardSerializer

    def get_queryset(self):
        user = self.request.user
        return Board.objects.filter(project__created_by=user)


class ColumnViewSet(ModelViewSet):
    serializer_class = ColumnSerializer

    def get_queryset(self):
        return Column.objects.filter(board__project__created_by=self.request.user)

    @action(detail=False, methods=["post"])
    def reorder(self, request):
        for item in request.data.get("columns", []):
            Column.objects.filter(id=item["id"]).update(order=item["order"])
        return Response(status=204)


class TaskViewSet(ModelViewSet):
    serializer_class = TaskSerializer

    def get_queryset(self):
        return Task.objects.filter(column__board__project__created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=False, methods=["post"])
    def reorder(self, request):
        for item in request.data.get("tasks", []):
            Task.objects.filter(id=item["id"]).update(
                order=item["order"], column_id=item["column"]
            )
        return Response(status=204)


class CommentViewSet(ModelViewSet):
    serializer_class = CommentSerializer

    def get_queryset(self):
        task_id = self.kwargs.get("task_pk")
        return Comment.objects.filter(task_id=task_id)

    def perform_create(self, serializer):
        serializer.save(task_id=self.kwargs["task_pk"], author=self.request.user)
