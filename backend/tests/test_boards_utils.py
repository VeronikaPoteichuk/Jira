import pytest
import json
from unittest.mock import patch, MagicMock
from django.test import RequestFactory
from django.contrib.auth import get_user_model
from boards.utils import create_github_branch, github_webhook
from boards.models import Board, Column, Task, TaskHistory
from projects.models import Project

User = get_user_model()


@pytest.mark.django_db
class TestCreateGithubBranch:

    @patch("boards.utils.requests.get")
    @patch("boards.utils.requests.post")
    def test_create_github_branch_success(self, mock_post, mock_get):
        mock_get_response = MagicMock()
        mock_get_response.json.return_value = {"object": {"sha": "abc123"}}
        mock_get_response.raise_for_status.return_value = None
        mock_get.return_value = mock_get_response

        mock_post_response = MagicMock()
        mock_post_response.raise_for_status.return_value = None
        mock_post.return_value = mock_post_response

        result = create_github_branch("owner/repo", "feature-branch", "token123")

        assert (
            result["url"] == "https://github.com/owner/repo/tree/feature/feature-branch"
        )
        assert result["sha"] == "abc123"

        mock_get.assert_called_once_with(
            "https://api.github.com/repos/owner/repo/git/ref/heads/main",
            headers={
                "Authorization": "token token123",
                "Accept": "application/vnd.github+json",
            },
            timeout=5,
        )

        mock_post.assert_called_once_with(
            "https://api.github.com/repos/owner/repo/git/refs",
            headers={
                "Authorization": "token token123",
                "Accept": "application/vnd.github+json",
            },
            json={"ref": "refs/heads/feature/feature-branch", "sha": "abc123"},
            timeout=5,
        )

    @patch("boards.utils.requests.get")
    def test_create_github_branch_get_error(self, mock_get):
        mock_get.side_effect = Exception("Network error")

        with pytest.raises(Exception):
            create_github_branch("owner/repo", "feature-branch", "token123")

    @patch("boards.utils.requests.get")
    @patch("boards.utils.requests.post")
    def test_create_github_branch_post_error(self, mock_post, mock_get):
        mock_get_response = MagicMock()
        mock_get_response.json.return_value = {"object": {"sha": "abc123"}}
        mock_get_response.raise_for_status.return_value = None
        mock_get.return_value = mock_get_response

        mock_post.side_effect = Exception("Creation failed")

        with pytest.raises(Exception):
            create_github_branch("owner/repo", "feature-branch", "token123")

    @patch("boards.utils.requests.get")
    @patch("boards.utils.requests.post")
    def test_create_github_branch_custom_base(self, mock_post, mock_get):
        mock_get_response = MagicMock()
        mock_get_response.json.return_value = {"object": {"sha": "def456"}}
        mock_get_response.raise_for_status.return_value = None
        mock_get.return_value = mock_get_response

        mock_post_response = MagicMock()
        mock_post_response.raise_for_status.return_value = None
        mock_post.return_value = mock_post_response

        result = create_github_branch(
            "owner/repo", "feature-branch", "token123", "develop"
        )

        assert result["sha"] == "def456"
        mock_get.assert_called_once_with(
            "https://api.github.com/repos/owner/repo/git/ref/heads/develop",
            headers={
                "Authorization": "token token123",
                "Accept": "application/vnd.github+json",
            },
            timeout=5,
        )


@pytest.mark.django_db
class TestGithubWebhook:

    def setup_method(self):
        self.factory = RequestFactory()
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )
        self.project = Project.objects.create(name="Test Project", created_by=self.user)
        self.board = Board.objects.create(
            name="Test Board", project=self.project, created_by=self.user
        )
        self.column = Column.objects.create(board=self.board, name="To Do", order=0)
        self.task = Task.objects.create(
            id_in_board=1,
            column=self.column,
            title="Test Task",
            description="Test Description",
            author=self.user,
            branch_name="feature/test-branch",
        )

    def test_github_webhook_invalid_method(self):
        request = self.factory.get("/webhook/")
        response = github_webhook(request)

        assert response.status_code == 405
        assert json.loads(response.content)["error"] == "Invalid method"

    def test_github_webhook_invalid_payload(self):
        request = self.factory.post(
            "/webhook/", data="invalid json", content_type="application/json"
        )
        response = github_webhook(request)

        assert response.status_code == 400
        assert json.loads(response.content)["error"] == "Invalid payload"

    @patch("boards.utils.async_to_sync")
    @patch("boards.utils.get_channel_layer")
    def test_github_webhook_branch_created(
        self, mock_channel_layer, mock_async_to_sync
    ):
        payload = {"ref_type": "branch", "ref": "feature/test-branch"}

        request = self.factory.post(
            "/webhook/",
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_GITHUB_EVENT="create",
        )

        response = github_webhook(request)

        assert response.status_code == 200
        assert json.loads(response.content)["status"] == "ok"

        history = TaskHistory.objects.filter(
            task=self.task, action="Branch created"
        ).first()
        assert history is not None
        assert "feature/test-branch" in history.details

    @patch("boards.utils.async_to_sync")
    @patch("boards.utils.get_channel_layer")
    def test_github_webhook_branch_deleted(
        self, mock_channel_layer, mock_async_to_sync
    ):
        payload = {"ref_type": "branch", "ref": "feature/test-branch"}

        request = self.factory.post(
            "/webhook/",
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_GITHUB_EVENT="delete",
        )

        response = github_webhook(request)

        assert response.status_code == 200
        assert json.loads(response.content)["status"] == "ok"

        history = TaskHistory.objects.filter(
            task=self.task, action="Branch deleted"
        ).first()
        assert history is not None

    @patch("boards.utils.async_to_sync")
    @patch("boards.utils.get_channel_layer")
    def test_github_webhook_push_event(self, mock_channel_layer, mock_async_to_sync):
        payload = {
            "ref": "refs/heads/feature/test-branch",
            "commits": [
                {
                    "message": "Test commit",
                    "url": "https://github.com/test/commit/123",
                    "author": {"name": "Test Author"},
                }
            ],
        }

        request = self.factory.post(
            "/webhook/",
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_GITHUB_EVENT="push",
        )

        response = github_webhook(request)

        assert response.status_code == 200
        assert json.loads(response.content)["status"] == "ok"

        history = TaskHistory.objects.filter(
            task=self.task, action="Commit pushed"
        ).first()
        assert history is not None
        assert "Test commit" in history.details

    @patch("boards.utils.async_to_sync")
    @patch("boards.utils.get_channel_layer")
    def test_github_webhook_pull_request_created(
        self, mock_channel_layer, mock_async_to_sync
    ):
        payload = {
            "action": "opened",
            "pull_request": {
                "head": {"ref": "feature/test-branch"},
                "title": "Test PR",
                "html_url": "https://github.com/test/pr/123",
            },
        }

        request = self.factory.post(
            "/webhook/",
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_GITHUB_EVENT="pull_request",
        )

        response = github_webhook(request)

        assert response.status_code == 200
        assert json.loads(response.content)["status"] == "ok"

        history = TaskHistory.objects.filter(task=self.task, action="PR opened").first()
        assert history is not None

    @patch("boards.utils.async_to_sync")
    @patch("boards.utils.get_channel_layer")
    def test_github_webhook_pull_request_review(
        self, mock_channel_layer, mock_async_to_sync
    ):
        payload = {
            "action": "submitted",
            "review": {
                "user": {"login": "reviewer"},
                "state": "approved",
                "html_url": "https://github.com/test/review/123",
            },
            "pull_request": {"head": {"ref": "feature/test-branch"}},
        }

        request = self.factory.post(
            "/webhook/",
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_GITHUB_EVENT="pull_request_review",
        )

        response = github_webhook(request)

        assert response.status_code == 200
        assert json.loads(response.content)["status"] == "ok"

        history = TaskHistory.objects.filter(
            task=self.task, action="Review submitted"
        ).first()
        assert history is not None
        assert "reviewer" in history.details

    @patch("boards.utils.async_to_sync")
    @patch("boards.utils.get_channel_layer")
    def test_github_webhook_review_comment(
        self, mock_channel_layer, mock_async_to_sync
    ):
        payload = {
            "action": "created",
            "comment": {
                "user": {"login": "commenter"},
                "body": "Great work!",
                "html_url": "https://github.com/test/comment/123",
            },
            "pull_request": {"head": {"ref": "feature/test-branch"}},
        }

        request = self.factory.post(
            "/webhook/",
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_GITHUB_EVENT="pull_request_review_comment",
        )

        response = github_webhook(request)

        assert response.status_code == 200
        assert json.loads(response.content)["status"] == "ok"

        history = TaskHistory.objects.filter(
            task=self.task, action="Review comment"
        ).first()
        assert history is not None
        assert "commenter" in history.details

    def test_github_webhook_unknown_event(self):
        payload = {"test": "data"}

        request = self.factory.post(
            "/webhook/",
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_GITHUB_EVENT="unknown_event",
        )

        response = github_webhook(request)

        assert response.status_code == 200
        assert json.loads(response.content)["status"] == "ok"

    def test_github_webhook_task_not_found(self):
        payload = {"ref_type": "branch", "ref": "feature/non-existent-branch"}

        request = self.factory.post(
            "/webhook/",
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_GITHUB_EVENT="create",
        )

        response = github_webhook(request)

        assert response.status_code == 200
        assert json.loads(response.content)["status"] == "ok"

        history_count = TaskHistory.objects.count()
        assert history_count == 0

    @patch("boards.utils.async_to_sync")
    @patch("boards.utils.get_channel_layer")
    def test_github_webhook_review_comment_no_task(
        self, mock_channel_layer, mock_async_to_sync
    ):
        mock_channel_layer.return_value = MagicMock()
        mock_async_to_sync.return_value = MagicMock()

        payload = {
            "action": "created",
            "comment": {
                "user": {"login": "reviewer"},
                "body": "Great work!",
                "html_url": "https://github.com/test/repo/pull/1#discussion_r123",
            },
            "pull_request": {"head": {"ref": "feature/non-existent-task"}},
        }

        request = self.factory.post(
            "/webhook/",
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_GITHUB_EVENT="pull_request_review_comment",
        )

        response = github_webhook(request)

        assert response.status_code == 200
        assert json.loads(response.content)["status"] == "ok"

        history = TaskHistory.objects.filter(action="Review comment").first()
        assert history is None

    @patch("boards.utils.async_to_sync")
    @patch("boards.utils.get_channel_layer")
    def test_github_webhook_review_comment_wrong_action(
        self, mock_channel_layer, mock_async_to_sync
    ):
        mock_channel_layer.return_value = MagicMock()
        mock_async_to_sync.return_value = MagicMock()

        payload = {
            "action": "edited",
            "comment": {
                "user": {"login": "reviewer"},
                "body": "Great work!",
                "html_url": "https://github.com/test/repo/pull/1#discussion_r123",
            },
            "pull_request": {"head": {"ref": "feature/test-task-1"}},
        }

        request = self.factory.post(
            "/webhook/",
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_GITHUB_EVENT="pull_request_review_comment",
        )

        response = github_webhook(request)

        assert response.status_code == 200
        assert json.loads(response.content)["status"] == "ok"

        history = TaskHistory.objects.filter(action="Review comment").first()
        assert history is None

    @patch("boards.utils.async_to_sync")
    @patch("boards.utils.get_channel_layer")
    def test_github_webhook_pull_request_synchronize(
        self, mock_channel_layer, mock_async_to_sync
    ):
        mock_channel_layer.return_value = MagicMock()
        mock_async_to_sync.return_value = MagicMock()

        payload = {
            "action": "synchronize",
            "sender": {"login": "developer"},
            "pull_request": {
                "head": {"ref": "feature/test-branch"},
                "title": "Test PR",
                "html_url": "https://github.com/test/pr/123",
            },
        }

        request = self.factory.post(
            "/webhook/",
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_GITHUB_EVENT="pull_request",
        )

        response = github_webhook(request)

        assert response.status_code == 200
        assert json.loads(response.content)["status"] == "ok"

        history = TaskHistory.objects.filter(
            task=self.task, action="Commit added to PR"
        ).first()
        assert history is not None
        assert "developer" in history.details

    @patch("boards.utils.async_to_sync")
    @patch("boards.utils.get_channel_layer")
    def test_github_webhook_pull_request_review_ignored(
        self, mock_channel_layer, mock_async_to_sync
    ):
        mock_channel_layer.return_value = MagicMock()
        mock_async_to_sync.return_value = MagicMock()

        payload = {
            "action": "edited",
            "review": {
                "user": {"login": "reviewer"},
                "state": "approved",
                "html_url": "https://github.com/test/review/123",
            },
            "pull_request": {"head": {"ref": "feature/test-task-1"}},
        }

        request = self.factory.post(
            "/webhook/",
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_GITHUB_EVENT="pull_request_review",
        )

        response = github_webhook(request)

        assert response.status_code == 200
        assert json.loads(response.content)["status"] == "ok"

        history = TaskHistory.objects.filter(
            task=self.task, action="Review submitted"
        ).first()
        assert history is None

    @patch("boards.utils.async_to_sync")
    @patch("boards.utils.get_channel_layer")
    def test_github_webhook_pull_request_review_thread_submitted(
        self, mock_channel_layer, mock_async_to_sync
    ):
        mock_channel_layer.return_value = MagicMock()
        mock_async_to_sync.return_value = MagicMock()

        payload = {
            "action": "submitted",
            "thread": {
                "comments": [
                    {
                        "user": {"login": "reviewer"},
                        "body": "This looks good!",
                        "html_url": "https://github.com/test/thread/123",
                    }
                ]
            },
            "pull_request": {"head": {"ref": "feature/test-branch"}},
        }

        request = self.factory.post(
            "/webhook/",
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_GITHUB_EVENT="pull_request_review_thread",
        )

        response = github_webhook(request)

        assert response.status_code == 200
        assert json.loads(response.content)["status"] == "ok"

        history = TaskHistory.objects.filter(
            task=self.task, action="Review thread submitted"
        ).first()
        assert history is not None
        assert "reviewer" in history.details
        assert "This looks good!" in history.details

    @patch("boards.utils.async_to_sync")
    @patch("boards.utils.get_channel_layer")
    def test_github_webhook_pull_request_review_thread_resolved(
        self, mock_channel_layer, mock_async_to_sync
    ):
        mock_channel_layer.return_value = MagicMock()
        mock_async_to_sync.return_value = MagicMock()

        payload = {
            "action": "resolved",
            "thread": {
                "comments": [
                    {
                        "user": {"login": "reviewer"},
                        "body": "Issue resolved",
                        "html_url": "https://github.com/test/thread/123",
                    }
                ]
            },
            "pull_request": {"head": {"ref": "feature/test-branch"}},
        }

        request = self.factory.post(
            "/webhook/",
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_GITHUB_EVENT="pull_request_review_thread",
        )

        response = github_webhook(request)

        assert response.status_code == 200
        assert json.loads(response.content)["status"] == "ok"

        history = TaskHistory.objects.filter(
            task=self.task, action="Review thread resolved"
        ).first()
        assert history is not None

    @patch("boards.utils.async_to_sync")
    @patch("boards.utils.get_channel_layer")
    def test_github_webhook_pull_request_review_thread_unresolved(
        self, mock_channel_layer, mock_async_to_sync
    ):
        mock_channel_layer.return_value = MagicMock()
        mock_async_to_sync.return_value = MagicMock()

        payload = {
            "action": "unresolved",
            "thread": {
                "comments": [
                    {
                        "user": {"login": "reviewer"},
                        "body": "Issue reopened",
                        "html_url": "https://github.com/test/thread/123",
                    }
                ]
            },
            "pull_request": {"head": {"ref": "feature/test-branch"}},
        }

        request = self.factory.post(
            "/webhook/",
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_GITHUB_EVENT="pull_request_review_thread",
        )

        response = github_webhook(request)

        assert response.status_code == 200
        assert json.loads(response.content)["status"] == "ok"

        history = TaskHistory.objects.filter(
            task=self.task, action="Review thread reopened"
        ).first()
        assert history is not None

    @patch("boards.utils.async_to_sync")
    @patch("boards.utils.get_channel_layer")
    def test_github_webhook_pull_request_review_thread_unknown_action(
        self, mock_channel_layer, mock_async_to_sync
    ):
        mock_channel_layer.return_value = MagicMock()
        mock_async_to_sync.return_value = MagicMock()

        payload = {
            "action": "unknown_action",
            "thread": {
                "comments": [
                    {
                        "user": {"login": "reviewer"},
                        "body": "Some comment",
                        "html_url": "https://github.com/test/thread/123",
                    }
                ]
            },
            "pull_request": {"head": {"ref": "feature/test-branch"}},
        }

        request = self.factory.post(
            "/webhook/",
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_GITHUB_EVENT="pull_request_review_thread",
        )

        response = github_webhook(request)

        assert response.status_code == 200
        assert json.loads(response.content)["status"] == "ok"

        history = TaskHistory.objects.filter(
            task=self.task, action="Thread event: unknown_action"
        ).first()
        assert history is not None

    @patch("boards.utils.async_to_sync")
    @patch("boards.utils.get_channel_layer")
    def test_github_webhook_pull_request_review_thread_no_comments(
        self, mock_channel_layer, mock_async_to_sync
    ):
        mock_channel_layer.return_value = MagicMock()
        mock_async_to_sync.return_value = MagicMock()

        payload = {
            "action": "submitted",
            "thread": {"comments": []},
            "pull_request": {"head": {"ref": "feature/test-task-1"}},
        }

        request = self.factory.post(
            "/webhook/",
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_GITHUB_EVENT="pull_request_review_thread",
        )

        response = github_webhook(request)

        assert response.status_code == 200
        assert json.loads(response.content)["status"] == "ignored"

        history = TaskHistory.objects.filter(task=self.task).first()
        assert history is None

    @patch("boards.utils.async_to_sync")
    @patch("boards.utils.get_channel_layer")
    def test_github_webhook_pull_request_review_thread_no_task(
        self, mock_channel_layer, mock_async_to_sync
    ):
        mock_channel_layer.return_value = MagicMock()
        mock_async_to_sync.return_value = MagicMock()

        payload = {
            "action": "submitted",
            "thread": {
                "comments": [
                    {
                        "user": {"login": "reviewer"},
                        "body": "Some comment",
                        "html_url": "https://github.com/test/thread/123",
                    }
                ]
            },
            "pull_request": {"head": {"ref": "feature/non-existent-task"}},
        }

        request = self.factory.post(
            "/webhook/",
            data=json.dumps(payload),
            content_type="application/json",
            HTTP_X_GITHUB_EVENT="pull_request_review_thread",
        )

        response = github_webhook(request)

        assert response.status_code == 200
        assert json.loads(response.content)["status"] == "not_found"

        history = TaskHistory.objects.filter(task=self.task).first()
        assert history is None
