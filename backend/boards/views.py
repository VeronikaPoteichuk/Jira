from adrf.viewsets import ModelViewSet
from .models import Board, Column, Task, Comment
from .serializers import (
    BoardSerializer,
    ColumnSerializer,
    TaskWriteSerializer,
    TaskReadSerializer,
    CommentSerializer,
)
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status


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
    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return TaskWriteSerializer
        return TaskReadSerializer

    def get_queryset(self):
        return Task.objects.filter(
            column__board__project__created_by=self.request.user
        ).select_related("column__board__project", "author", "assignee", "column")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task = serializer.save(author=self.request.user)
        read_serializer = TaskReadSerializer(
            task, context=self.get_serializer_context()
        )
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        task = serializer.save()

        read_serializer = TaskReadSerializer(
            task, context=self.get_serializer_context()
        )
        return Response(read_serializer.data, status=status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return self.update(request, *args, **kwargs)

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
