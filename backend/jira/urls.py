from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from users.views import AsyncUserViewSet
from rest_framework.routers import DefaultRouter
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenRefreshView
from users.views_auth import LoginView, LogoutView, GoogleAuthView
import projects.urls
import boards.urls
from boards.views import ProjectBoardsAPIView
from projects.github_auth import (
    GitHubLoginView,
    GitHubCallbackView,
    ValidateGitHubRepoAccessView,
    github_user_info,
)
from boards.utils import github_webhook
from boards.views import TaskHistoryAPIView, TaskWorkLogAPIView


@ensure_csrf_cookie
def csrf(request):
    return JsonResponse({"message": "CSRF cookie set"})


router = DefaultRouter()
router.include_root_view = False
router.register(r"users", AsyncUserViewSet, basename="user")

urlpatterns = [
    path("", include(router.urls)),
    path("admin/", admin.site.urls),
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "swagger/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"
    ),
    path("redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    path("csrf/", csrf),
    path("api/auth/login/", LoginView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/logout/", LogoutView.as_view(), name="token_logout"),
    path("api/auth/google/", GoogleAuthView.as_view(), name="google_auth"),
    path(
        "api/projects/<int:project_id>/boards/",
        ProjectBoardsAPIView.as_view(),
        name="project-boards",
    ),
    path("api/", include("projects.urls")),
    path("api/", include("boards.urls")),
    path("api/github/login/", GitHubLoginView.as_view(), name="github-login"),
    path("api/github/callback/", GitHubCallbackView.as_view(), name="github-callback"),
    path(
        "api/github/validate_repo_access/",
        ValidateGitHubRepoAccessView.as_view(),
        name="github-validate-repo",
    ),
    path("api/github/user-info/", github_user_info, name="github-user-info"),
    path("webhooks/github/", github_webhook, name="github-webhook"),
    path(
        "api/tasks/<int:pk>/history/", TaskHistoryAPIView.as_view(), name="task-history"
    ),
    path(
        "api/tasks/<int:pk>/worklog/", TaskWorkLogAPIView.as_view(), name="task-worklog"
    ),
]


urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
