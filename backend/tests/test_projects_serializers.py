import pytest
from unittest.mock import patch
from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory
from rest_framework import serializers
from projects.serializers import ProjectSerializer
from projects.models import Project
from boards.models import Board

User = get_user_model()


@pytest.mark.django_db
class TestProjectSerializer:

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

        self.project = Project.objects.create(
            name="Test Project", description="Test Description", created_by=self.user1
        )

        self.project.members.add(self.user2, self.user3)

    def test_project_serializer_fields(self):
        serializer = ProjectSerializer(self.project)
        data = serializer.data

        assert data["id"] == self.project.id
        assert data["name"] == "Test Project"
        assert data["description"] == "Test Description"
        assert data["created_at"] is not None
        assert data["github_repo"] is None

        assert len(data["members"]) == 2
        assert "user2@test.com" in data["members"]
        assert "user3@test.com" in data["members"]

        assert data["has_token"] is False
        assert "token" not in data

    def test_project_serializer_with_github_repo(self):
        self.project.github_repo = "owner/repo"
        self.project.save()

        serializer = ProjectSerializer(self.project)
        data = serializer.data

        assert data["github_repo"] == "owner/repo"

    def test_project_serializer_with_token(self):
        self.project.set_github_token("test_token_123")
        self.project.save()

        serializer = ProjectSerializer(self.project)
        data = serializer.data

        assert data["has_token"] is True

    def test_get_board_count(self):
        board1 = Board.objects.create(
            name="Board 1", project=self.project, created_by=self.user1
        )

        board2 = Board.objects.create(
            name="Board 2", project=self.project, created_by=self.user1
        )

        serializer = ProjectSerializer(self.project)
        data = serializer.data

        assert data["board_count"] == 2

    def test_get_board_count_zero(self):
        serializer = ProjectSerializer(self.project)
        data = serializer.data

        assert data["board_count"] == 0

    def test_get_has_token_true(self):
        self.project.set_github_token("test_token_123")
        self.project.save()

        serializer = ProjectSerializer(self.project)
        data = serializer.data

        assert data["has_token"] is True

    def test_get_has_token_false(self):
        serializer = ProjectSerializer(self.project)
        data = serializer.data

        assert data["has_token"] is False

    def test_serializer_validation_valid_data(self):
        data = {
            "name": "New Project",
            "description": "New Description",
            "github_repo": "owner/repo",
        }

        serializer = ProjectSerializer(data=data)
        assert serializer.is_valid()

    def test_serializer_validation_missing_required_fields(self):
        data = {"description": "New Description"}

        serializer = ProjectSerializer(data=data)
        assert not serializer.is_valid()
        assert "name" in serializer.errors

    def test_serializer_create(self):
        data = {
            "name": "New Project",
            "description": "New Description",
            "github_repo": "owner/repo",
        }

        request = self.factory.post("/")
        request.user = self.user1

        serializer = ProjectSerializer(data=data, context={"request": request})
        assert serializer.is_valid()

        project = serializer.save(created_by=self.user1)

        assert project.name == "New Project"
        assert project.description == "New Description"
        assert project.github_repo == "owner/repo"
        assert project.created_by == self.user1

    @patch("projects.serializers.validate_github_repo_access")
    def test_update_with_github_repo_and_session_token(self, mock_validate):
        mock_validate.return_value = True

        data = {"name": "Updated Project", "github_repo": "owner/new-repo"}

        request = self.factory.put("/")
        request.session = {"github_token": "session_token"}
        request.data = data

        serializer = ProjectSerializer(
            self.project, data=data, context={"request": request}
        )
        assert serializer.is_valid()

        updated_project = serializer.save()

        assert updated_project.name == "Updated Project"
        assert updated_project.github_repo == "owner/new-repo"
        mock_validate.assert_called_once_with("session_token", "owner/new-repo")

    @patch("projects.serializers.validate_github_repo_access")
    def test_update_with_github_repo_and_data_token(self, mock_validate):
        mock_validate.return_value = True

        data = {
            "name": "Updated Project",
            "github_repo": "owner/new-repo",
            "token": "data_token",
        }

        request = self.factory.put("/")
        request.session = {}
        request.data = data

        serializer = ProjectSerializer(
            self.project, data=data, context={"request": request}
        )
        assert serializer.is_valid()

        updated_project = serializer.save()

        assert updated_project.name == "Updated Project"
        assert updated_project.github_repo == "owner/new-repo"
        mock_validate.assert_called_once_with("data_token", "owner/new-repo")

    @patch("projects.serializers.validate_github_repo_access")
    def test_update_with_github_repo_no_access(self, mock_validate):
        mock_validate.return_value = False

        data = {"name": "Updated Project", "github_repo": "owner/new-repo"}

        request = self.factory.put("/")
        request.session = {"github_token": "session_token"}
        request.data = data

        serializer = ProjectSerializer(
            self.project, data=data, context={"request": request}
        )

        assert serializer.is_valid()

        with pytest.raises(serializers.ValidationError) as exc_info:
            serializer.save()

        assert "No access to GitHub repository" in str(exc_info.value)

    @patch("projects.serializers.validate_github_repo_access")
    def test_update_with_github_repo_no_token(self, mock_validate):
        data = {"name": "Updated Project", "github_repo": "owner/new-repo"}

        request = self.factory.put("/")
        request.session = {}
        request.data = data

        serializer = ProjectSerializer(
            self.project, data=data, context={"request": request}
        )
        assert serializer.is_valid()

        updated_project = serializer.save()

        assert updated_project.name == "Updated Project"
        assert updated_project.github_repo == "owner/new-repo"
        mock_validate.assert_not_called()

    def test_update_with_token_field(self):
        data = {"name": "Updated Project", "token": "new_token_123"}

        request = self.factory.put("/")
        request.session = {}
        request.data = data

        serializer = ProjectSerializer(
            self.project, data=data, context={"request": request}
        )
        assert serializer.is_valid()

        updated_project = serializer.save()

        assert updated_project.name == "Updated Project"
        assert updated_project.has_token() is True
        assert updated_project.get_github_token() == "new_token_123"

    def test_update_without_github_repo(self):
        data = {"name": "Updated Project", "description": "Updated Description"}

        request = self.factory.put("/")
        request.session = {}
        request.data = data

        serializer = ProjectSerializer(
            self.project, data=data, context={"request": request}
        )
        assert serializer.is_valid()

        updated_project = serializer.save()

        assert updated_project.name == "Updated Project"
        assert updated_project.description == "Updated Description"

    def test_read_only_fields(self):
        data = {
            "name": "Test Project",
            "created_by": self.user2.id,
            "github_token": "test_token",
        }

        serializer = ProjectSerializer(data=data)
        assert serializer.is_valid()

        project = serializer.save(created_by=self.user1)
        assert project.created_by == self.user1
        assert project.github_token != "test_token"

    def test_members_field_read_only(self):
        data = {"name": "Test Project", "members": ["user4@test.com"]}

        serializer = ProjectSerializer(data=data)
        assert serializer.is_valid()

        project = serializer.save(created_by=self.user1)
        assert project.members.count() == 0

    def test_token_field_write_only(self):
        self.project.set_github_token("test_token_123")
        self.project.save()

        serializer = ProjectSerializer(self.project)
        data = serializer.data

        assert "token" not in data
        assert data["has_token"] is True

    def test_serializer_with_context(self):
        request = self.factory.get("/")
        request.user = self.user1

        serializer = ProjectSerializer(self.project, context={"request": request})
        data = serializer.data

        assert data["name"] == "Test Project"
        assert serializer.context["request"] == request

    def test_serializer_partial_update(self):
        data = {"name": "Partially Updated Project"}

        request = self.factory.patch("/")
        request.session = {}
        request.data = data

        serializer = ProjectSerializer(
            self.project, data=data, partial=True, context={"request": request}
        )
        assert serializer.is_valid()

        updated_project = serializer.save()

        assert updated_project.name == "Partially Updated Project"
        assert updated_project.description == "Test Description"

    def test_serializer_nested_validation(self):
        data = {"name": "", "description": "Test Description"}

        serializer = ProjectSerializer(data=data)
        assert not serializer.is_valid()
        assert "name" in serializer.errors

    def test_serializer_with_large_description(self):
        large_description = "A" * 1000

        data = {"name": "Test Project", "description": large_description}

        serializer = ProjectSerializer(data=data)
        assert serializer.is_valid()

        project = serializer.save(created_by=self.user1)
        assert project.description == large_description

    def test_serializer_github_repo_format(self):
        valid_repos = [
            "owner/repo",
            "user123/project-name",
            "org/sub-project",
            "owner/repo-name_with_underscores",
        ]

        for repo in valid_repos:
            data = {"name": "Test Project", "github_repo": repo}

            serializer = ProjectSerializer(data=data)
            assert serializer.is_valid(), f"Failed for repo: {repo}"

    def test_serializer_complex_update_scenario(self):
        @patch("projects.serializers.validate_github_repo_access")
        def test_update(mock_validate):
            mock_validate.return_value = True

            project = Project.objects.create(
                name="Original Project",
                description="Original Description",
                created_by=self.user1,
            )

            data = {
                "name": "Updated Project",
                "description": "Updated Description",
                "github_repo": "owner/repo",
            }

            request = self.factory.put("/")
            request.session = {"github_token": "session_token"}
            request.data = data

            serializer = ProjectSerializer(
                project, data=data, context={"request": request}
            )
            assert serializer.is_valid()

            updated_project = serializer.save()

            assert updated_project.name == "Updated Project"
            assert updated_project.description == "Updated Description"
            assert updated_project.github_repo == "owner/repo"

            mock_validate.assert_called_once_with("session_token", "owner/repo")

        test_update()
