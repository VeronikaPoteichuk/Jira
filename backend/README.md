# Jira-like Project Management System - Backend

Project management system with GitHub API integration on Django REST Framework.

### 1. Installing Dependencies

```bash
# Install uv for dependency management
pip install uv

# Compile requirements from pyproject.toml
uv pip compile pyproject.toml --output-file requirements.lock
uv pip compile pyproject.toml --extra test --output-file requirements_test.lock
```

### 3. Running

```bash
docker-compose up --build
```

**Access:**

- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/api/schema/swagger-ui/

### 4. Creating Superuser

```bash
docker-compose exec backend python3 manage.py createsuperuser
```

## GitHub Token for Projects

For GitHub repository integration, users must:

1. Create a Personal Access Token: https://github.com/settings/tokens
2. Select permissions: `repo` (full repository access)
3. Add the token in project settings in the application

## 🔗 GitHub Webhook

Add webhook in GitHub repository settings:

```
Payload URL: http://localhost:8000/webhooks/github/
Content type: application/json
Events: Branch creation/deletion, Pushes, Pull requests, Reviews
```

## Testing

```bash
docker-compose run tests
```

---

**⚠️ Important**: Be sure to configure GitHub OAuth before running the application.
