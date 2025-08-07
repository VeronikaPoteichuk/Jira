import pytest
from unittest.mock import patch, MagicMock
from projects.utils import validate_github_repo_access


class TestValidateGithubRepoAccess:

    @patch("projects.utils.requests.get")
    def test_validate_github_repo_access_success(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        result = validate_github_repo_access("test_token", "owner/repo")

        assert result is True
        mock_get.assert_called_once_with(
            "https://api.github.com/repos/owner/repo",
            headers={
                "Authorization": "token test_token",
                "Accept": "application/vnd.github+json",
            },
            timeout=5,
        )

    @patch("projects.utils.requests.get")
    def test_validate_github_repo_access_unauthorized(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_get.return_value = mock_response

        result = validate_github_repo_access("invalid_token", "owner/repo")

        assert result is False

    @patch("projects.utils.requests.get")
    def test_validate_github_repo_access_forbidden(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 403
        mock_get.return_value = mock_response

        result = validate_github_repo_access("token", "private/repo")

        assert result is False

    @patch("projects.utils.requests.get")
    def test_validate_github_repo_access_not_found(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_get.return_value = mock_response

        result = validate_github_repo_access("token", "nonexistent/repo")

        assert result is False

    @patch("projects.utils.requests.get")
    def test_validate_github_repo_access_server_error(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_get.return_value = mock_response

        result = validate_github_repo_access("token", "owner/repo")

        assert result is False

    @patch("projects.utils.requests.get")
    def test_validate_github_repo_access_network_error(self, mock_get):
        mock_get.side_effect = Exception("Network error")

        with pytest.raises(Exception):
            validate_github_repo_access("token", "owner/repo")

    @patch("projects.utils.requests.get")
    def test_validate_github_repo_access_timeout(self, mock_get):
        mock_get.side_effect = TimeoutError("Request timeout")

        with pytest.raises(TimeoutError):
            validate_github_repo_access("token", "owner/repo")

    def test_validate_github_repo_access_empty_token(self):
        with patch("projects.utils.requests.get") as mock_get:
            mock_response = MagicMock()
            mock_response.status_code = 401
            mock_get.return_value = mock_response

            result = validate_github_repo_access("", "owner/repo")

            assert result is False

    def test_validate_github_repo_access_empty_repo(self):
        with patch("projects.utils.requests.get") as mock_get:
            mock_response = MagicMock()
            mock_response.status_code = 404
            mock_get.return_value = mock_response

            result = validate_github_repo_access("token", "")

            assert result is False

    @patch("projects.utils.requests.get")
    def test_validate_github_repo_access_complex_repo_name(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        result = validate_github_repo_access("token", "user-name/repo-name.with.dots")

        assert result is True
        mock_get.assert_called_once_with(
            "https://api.github.com/repos/user-name/repo-name.with.dots",
            headers={
                "Authorization": "token token",
                "Accept": "application/vnd.github+json",
            },
            timeout=5,
        )
