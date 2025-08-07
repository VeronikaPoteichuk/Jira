# Testing

## Running Tests

### Quick Start - Run All Tests

```bash
python3 run_all_tests.py
```

### Running Specific Tests

```bash
# All user tests
python3 run_all_tests.py tests/test_user.py

# Specific test
python3 run_all_tests.py tests/test_user.py::TestAsyncUserViewSet::test_list_users

# Tests with verbose output
python3 run_all_tests.py -v
```

### Running with Code Coverage

```bash
python3 run_all_tests.py --cov --cov-report=term-missing
```

## Test Configuration

### Django Test Settings

Tests use separate settings from `jira/test_settings.py`:

- SQLite in-memory database for fast tests
- MD5 password hashing for speed
- In-memory channel layer
- Automatic setting of `DJANGO_TESTING=True` environment variable

### Authentication in Tests

For user tests (`test_users_views.py`), authentication is disabled via the `DJANGO_TESTING=True` environment variable. This allows testing the API without the need to create JWT tokens.

In production, authentication works as usual:

- `create` - available to everyone (`AllowAny`)
- All other actions - require authentication (`IsAuthenticated`)

## Test Structure

- `test_auth_views.py`
- `test_boards_utils.py`
- `test_boards_views.py`
- `test_boards_serializers.py`
- `test_config.py`
- `test_github_auth.py`
- `test_projects_views.py`
- `test_projects_serializers.py`
- `test_projects_utils.py`
- `test_users_serializers.py`
- `test_users_views.py`
- `test_websocket.py`

## Test coverage: 95%

## Requirements

- Python 3.8+
- pytest
- pytest-django
- pytest-asyncio
