from rest_framework.viewsets import ModelViewSet
from django.db import models
from django.contrib.auth import get_user_model
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .models import Project
from .serializers import ProjectSerializer


class ProjectViewSet(ModelViewSet):
    serializer_class = ProjectSerializer

    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(
            models.Q(created_by=user) | models.Q(members=user)
        ).distinct()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"], url_path="add-member")
    def add_member(self, request, pk=None):
        """
        Add user by email to project participants (only for creator)
        """
        project = self.get_object()
        if project.created_by != request.user:
            return Response(
                {"detail": "Only the creator can add members."},
                status=status.HTTP_403_FORBIDDEN,
            )
        email = request.data.get("email")
        if not email:
            return Response(
                {"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST
            )
        User = get_user_model()
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )
        project.members.add(user)
        return Response(
            {"detail": f"User {email} added to project."}, status=status.HTTP_200_OK
        )

    def destroy(self, request, *args, **kwargs):
        project = self.get_object()
        if project.created_by != request.user:
            return Response(
                {"detail": "Only the creator can delete this project."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["post"], url_path="remove-member")
    def remove_member(self, request, pk=None):
        """
        Remove user from project participants (only for creator)
        """
        project = self.get_object()
        if project.created_by != request.user:
            return Response(
                {"detail": "Only the creator can remove members."},
                status=status.HTTP_403_FORBIDDEN,
            )
        email = request.data.get("email")
        if not email:
            return Response(
                {"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST
            )
        User = get_user_model()
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )
        project.members.remove(user)
        return Response(
            {"detail": f"User {email} removed from project."}, status=status.HTTP_200_OK
        )
