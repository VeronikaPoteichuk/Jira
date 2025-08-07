import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from rest_framework import status
from projects.views import ProjectViewSet
from projects.models import Project
from django.contrib.auth.models import AnonymousUser
from projects.serializers import ProjectSerializer
from django.db.utils import IntegrityError

User = get_user_model()


@pytest.mark.django_db
class TestProjectViewSet:

    def setup_method(self):
        self.factory = APIRequestFactory()
        self.user1 = User.objects.create_user(
            username="user1", email="user1@test.com", password="testpass123"
        )
        self.user2 = User.objects.create_user(
            username="user2", email="user2@test.com", password="testpass123"
        )
        self.user3 = User.objects.create_user(
            username="user3", email="user3@test.com", password="testpass123"
        )

        self.project1 = Project.objects.create(
            name="Test Project 1",
            description="Test Description 1",
            created_by=self.user1,
        )
        self.project1.members.add(self.user2)

        self.project2 = Project.objects.create(
            name="Test Project 2",
            description="Test Description 2",
            created_by=self.user2,
        )

        self.project3 = Project.objects.create(
            name="Test Project 3",
            description="Test Description 3",
            created_by=self.user3,
        )

    def test_get_queryset_creator(self):
        viewset = ProjectViewSet()
        request = self.factory.get("/")
        request.user = self.user1
        viewset.request = request

        queryset = viewset.get_queryset()
        assert queryset.count() == 1
        assert queryset.first().name == "Test Project 1"

    def test_get_queryset_member(self):
        viewset = ProjectViewSet()
        request = self.factory.get("/")
        request.user = self.user2
        viewset.request = request

        queryset = viewset.get_queryset()
        assert queryset.count() == 2  # project1 (member) + project2 (creator)
        project_names = [p.name for p in queryset]
        assert "Test Project 1" in project_names
        assert "Test Project 2" in project_names

    def test_get_queryset_unauthorized(self):
        viewset = ProjectViewSet()
        request = self.factory.get("/")
        request.user = AnonymousUser()
        viewset.request = request

        try:
            queryset = viewset.get_queryset()
            assert queryset.count() == 0
        except TypeError:
            pass

    def test_perform_create(self):
        viewset = ProjectViewSet()
        request = self.factory.post("/")
        request.user = self.user1
        viewset.request = request

        data = {"name": "New Project", "description": "New Description"}
        serializer = ProjectSerializer(data=data, context={"request": request})
        assert serializer.is_valid()

        viewset.perform_create(serializer)

        project = serializer.instance
        assert project.created_by == self.user1
        assert project.name == "New Project"
        assert project.description == "New Description"

        assert Project.objects.filter(id=project.id).exists()
        saved_project = Project.objects.get(id=project.id)
        assert saved_project.created_by == self.user1

    def test_perform_create_with_different_user(self):
        viewset = ProjectViewSet()
        request = self.factory.post("/")
        request.user = self.user2
        viewset.request = request

        data = {"name": "Another Project", "description": "Another Description"}
        serializer = ProjectSerializer(data=data, context={"request": request})
        assert serializer.is_valid()

        viewset.perform_create(serializer)

        project = serializer.instance
        assert project.created_by == self.user2
        assert project.name == "Another Project"
        assert project.description == "Another Description"

        assert Project.objects.filter(id=project.id).exists()
        saved_project = Project.objects.get(id=project.id)
        assert saved_project.created_by == self.user2

    def test_perform_create_without_user(self):
        viewset = ProjectViewSet()
        request = self.factory.post("/")
        request.user = None
        viewset.request = request

        data = {"name": "Test Project", "description": "Test Description"}
        serializer = ProjectSerializer(data=data, context={"request": request})
        assert serializer.is_valid()

        with pytest.raises(IntegrityError):
            viewset.perform_create(serializer)

    def test_get_serializer_context(self):
        viewset = ProjectViewSet()
        request = self.factory.get("/")
        request.user = self.user1
        viewset.request = request
        viewset.format_kwarg = None

        context = viewset.get_serializer_context()
        assert context["request"] == request

    def test_add_member_success(self):
        viewset = ProjectViewSet()
        request = self.factory.post("/")
        request.user = self.user1
        request.data = {"email": "user3@test.com"}
        viewset.request = request
        viewset.kwargs = {"pk": self.project1.pk}

        viewset.get_object = lambda: self.project1

        response = viewset.add_member(request, pk=self.project1.pk)

        assert response.status_code == status.HTTP_200_OK
        assert "User user3@test.com added to project." in response.data["detail"]

        self.project1.refresh_from_db()
        assert self.user3 in self.project1.members.all()

    def test_add_member_creator_only(self):
        viewset = ProjectViewSet()
        request = self.factory.post("/")
        request.user = self.user2
        request.data = {"email": "user3@test.com"}
        viewset.request = request
        viewset.kwargs = {"pk": self.project1.pk}

        viewset.get_object = lambda: self.project1

        response = viewset.add_member(request, pk=self.project1.pk)

        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert "Only the creator can add members." in response.data["detail"]

    def test_add_member_missing_email(self):
        viewset = ProjectViewSet()
        request = self.factory.post("/")
        request.user = self.user1
        request.data = {}
        viewset.request = request
        viewset.kwargs = {"pk": self.project1.pk}

        viewset.get_object = lambda: self.project1

        response = viewset.add_member(request, pk=self.project1.pk)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Email is required." in response.data["detail"]

    def test_add_member_user_not_found(self):
        viewset = ProjectViewSet()
        request = self.factory.post("/")
        request.data = {"email": "nonexistent@test.com"}
        request.user = self.user1
        viewset.request = request
        viewset.kwargs = {"pk": self.project1.pk}

        viewset.get_object = lambda: self.project1

        response = viewset.add_member(request, pk=self.project1.pk)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "User not found." in response.data["detail"]

    def test_add_member_already_member(self):
        viewset = ProjectViewSet()
        request = self.factory.post("/")
        request.data = {"email": "user2@test.com"}
        request.user = self.user1
        viewset.request = request
        viewset.kwargs = {"pk": self.project1.pk}

        viewset.get_object = lambda: self.project1

        response = viewset.add_member(request, pk=self.project1.pk)

        assert response.status_code == status.HTTP_200_OK

    def test_remove_member_success(self):
        viewset = ProjectViewSet()
        request = self.factory.post("/")
        request.data = {"email": "user2@test.com"}
        request.user = self.user1
        viewset.request = request
        viewset.kwargs = {"pk": self.project1.pk}

        viewset.get_object = lambda: self.project1

        response = viewset.remove_member(request, pk=self.project1.pk)

        assert response.status_code == status.HTTP_200_OK
        assert "User user2@test.com removed from project." in response.data["detail"]

        self.project1.refresh_from_db()
        assert self.user2 not in self.project1.members.all()

    def test_remove_member_creator_only(self):
        viewset = ProjectViewSet()
        request = self.factory.post("/")
        request.data = {"email": "user3@test.com"}
        request.user = self.user2
        viewset.request = request
        viewset.kwargs = {"pk": self.project1.pk}

        viewset.get_object = lambda: self.project1

        response = viewset.remove_member(request, pk=self.project1.pk)

        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert "Only the creator can remove members." in response.data["detail"]

    def test_remove_member_missing_email(self):
        viewset = ProjectViewSet()
        request = self.factory.post("/")
        request.user = self.user1
        request.data = {}
        viewset.request = request
        viewset.kwargs = {"pk": self.project1.pk}

        viewset.get_object = lambda: self.project1

        response = viewset.remove_member(request, pk=self.project1.pk)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Email is required." in response.data["detail"]

    def test_remove_member_user_not_found(self):
        viewset = ProjectViewSet()
        request = self.factory.post("/")
        request.data = {"email": "nonexistent@test.com"}
        request.user = self.user1
        viewset.request = request
        viewset.kwargs = {"pk": self.project1.pk}

        viewset.get_object = lambda: self.project1

        response = viewset.remove_member(request, pk=self.project1.pk)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "User not found." in response.data["detail"]

    def test_remove_member_not_member(self):
        viewset = ProjectViewSet()
        request = self.factory.post("/")
        request.data = {"email": "user3@test.com"}
        request.user = self.user1
        viewset.request = request
        viewset.kwargs = {"pk": self.project1.pk}

        viewset.get_object = lambda: self.project1

        response = viewset.remove_member(request, pk=self.project1.pk)

        assert response.status_code == status.HTTP_200_OK

    def test_destroy_creator(self):
        viewset = ProjectViewSet()
        request = self.factory.delete("/")
        request.user = self.user1
        viewset.request = request
        viewset.kwargs = {"pk": self.project1.pk}

        viewset.get_object = lambda: self.project1

        response = viewset.destroy(request, pk=self.project1.pk)

        assert response.status_code == status.HTTP_204_NO_CONTENT

        assert not Project.objects.filter(pk=self.project1.pk).exists()

    def test_destroy_member_forbidden(self):
        viewset = ProjectViewSet()
        request = self.factory.delete("/")
        request.user = self.user2
        viewset.request = request
        viewset.kwargs = {"pk": self.project1.pk}

        viewset.get_object = lambda: self.project1

        response = viewset.destroy(request, pk=self.project1.pk)

        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert Project.objects.filter(pk=self.project1.pk).exists()

    def test_serializer_class(self):
        viewset = ProjectViewSet()
        assert viewset.serializer_class.__name__ == "ProjectSerializer"
