from adrf.viewsets import ModelViewSet
from .models import Board, Column, Task
from .serializers import BoardSerializer, ColumnSerializer, TaskSerializer
from rest_framework.filters import OrderingFilter
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
    serializer_class = TaskSerializer

    def get_queryset(self):
        return Task.objects.filter(column__board__project__created_by=self.request.user)

    @action(detail=False, methods=["post"])
    def reorder(self, request):
        for item in request.data.get("tasks", []):
            Task.objects.filter(id=item["id"]).update(
                order=item["order"], column_id=item["column"]
            )
        return Response(status=204)
