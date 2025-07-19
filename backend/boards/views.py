from adrf.viewsets import ModelViewSet
from .models import Board, Column, Task, Comment
from .serializers import (
    BoardSerializer,
    ColumnSerializer,
    TaskWriteSerializer,
    TaskReadSerializer,
    CommentSerializer,
    TaskHistorySerializer,
)
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .utils import create_github_branch
import requests
from django.db import models


class BoardViewSet(ModelViewSet):
    serializer_class = BoardSerializer

    def get_queryset(self):
        user = self.request.user
        return (
            Board.objects.filter(
                models.Q(project__created_by=user) | models.Q(project__members=user)
            )
            .distinct()
            .select_related("project", "created_by")
            .prefetch_related(
                "columns",
                "columns__tasks",
                "columns__tasks__author",
                "columns__tasks__column__board__project",
            )
        )

    def perform_create(self, serializer):
        board = serializer.save(created_by=self.request.user)

        default_columns = ["To Do", "In Progress", "Done"]
        for i, name in enumerate(default_columns):
            Column.objects.create(board=board, name=name, order=i)

    @action(detail=True, methods=["get"])
    def tasks(self, request, pk=None):
        board = self.get_object()
        tasks = Task.objects.filter(column__board=board).select_related(
            "column__board__project", "author", "column"
        )
        serializer = TaskReadSerializer(tasks, many=True)
        return Response(serializer.data)


class ColumnViewSet(ModelViewSet):
    serializer_class = ColumnSerializer

    def get_queryset(self):
        return (
            Column.objects.filter(board__project__created_by=self.request.user)
            .select_related("board", "board__project")
            .prefetch_related("tasks", "tasks__author", "tasks__column__board__project")
        )

    @action(detail=False, methods=["post"])
    def reorder(self, request):
        columns_data = request.data.get("columns", [])
        for item in columns_data:
            Column.objects.filter(id=item["id"]).update(order=item["order"])

        board_id = columns_data[0].get("board") if columns_data else None
        if board_id is not None:
            updated_columns = self.get_queryset().filter(board_id=board_id)
        else:
            updated_columns = self.get_queryset()

        serializer = self.get_serializer(updated_columns, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TaskViewSet(ModelViewSet):
    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return TaskWriteSerializer
        return TaskReadSerializer

    def get_queryset(self):
        return Task.objects.filter(
            column__board__project__created_by=self.request.user
        ).select_related("column__board__project", "author", "column")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        task = serializer.save(author=request.user)

        if not task.id_in_board:
            board = task.column.board
            last_id = (
                Task.objects.filter(column__board=board).aggregate(
                    max_id=Max("id_in_board")
                )["max_id"]
                or 0
            )
            task.id_in_board = last_id + 1
            task.save()

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
        task_data = request.data.get("tasks", [])
        updated_tasks = []

        for item in task_data:
            id_in_board = item["id"]
            column_id = item["column"]
            order = item["order"]

            try:
                column = Column.objects.select_related("board").get(id=column_id)
            except Column.DoesNotExist:
                continue

            board = column.board

            task = Task.objects.filter(
                column__board=board, id_in_board=id_in_board
            ).first()

            if task:
                task.order = order
                task.column = column
                updated_tasks.append(task)

        if updated_tasks:
            Task.objects.bulk_update(updated_tasks, ["order", "column"])

        serializer = TaskReadSerializer(updated_tasks, many=True)
        return Response(
            {
                "detail": "The order of tasks has been updated.",
                "tasks": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def create_github_branch(self, request, pk=None):
        task = self.get_object()
        repo = request.data.get("repo")
        if not repo:
            return Response({"detail": "Repository not specified."}, status=400)

        title_slug = task.title.lower().replace(" ", "-")
        branch_suffix = f"TV-{task.id_in_board}-{title_slug}"
        branch_name = f"feature/{branch_suffix}"

        try:
            branch_info = create_github_branch(repo, branch_suffix)
            task.branch_name = branch_name
            task.save()

            return Response(
                {
                    "branch": branch_name,
                    "branch_url": branch_info["url"],
                },
                status=status.HTTP_201_CREATED,
            )
        except requests.HTTPError as e:
            print("GitHub brunch creation failed:", e.response.text)
            return Response({"error": str(e)}, status=400)


class CommentViewSet(ModelViewSet):
    serializer_class = CommentSerializer

    def get_queryset(self):
        task_id = self.kwargs.get("task_pk")
        return Comment.objects.filter(task_id=task_id).select_related("author", "task")

    def perform_create(self, serializer):
        serializer.save(task_id=self.kwargs["task_pk"], author=self.request.user)


class ProjectBoardsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        boards = Board.objects.filter(project_id=project_id)
        serializer = BoardSerializer(boards, many=True)
        return Response(serializer.data)


class TaskHistoryAPIView(APIView):
    def get(self, request, pk):
        task = Task.objects.get(pk=pk)
        history = task.history.order_by("-created_at")
        serializer = TaskHistorySerializer(history, many=True)
        return Response(serializer.data)
