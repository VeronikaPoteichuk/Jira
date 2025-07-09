import requests
from django.conf import settings
from django.http import JsonResponse, HttpResponseRedirect
from django.views import View
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from .models import Project
from .utils import validate_github_repo_access


class GitHubLoginView(View):
    def get(self, request):
        github_auth_url = (
            "https://github.com/login/oauth/authorize"
            f"?client_id={settings.GITHUB_CLIENT_ID}"
            "&scope=repo"
        )
        print(f"Redirecting to GitHub auth URL: {github_auth_url}")
        return HttpResponseRedirect(github_auth_url)


class GitHubCallbackView(View):
    def get(self, request):
        code = request.GET.get("code")
        if not code:
            return JsonResponse({"error": "Missing code"}, status=400)

        token_res = requests.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": settings.GITHUB_REDIRECT_URI,
            },
            timeout=5,
        )

        token_data = token_res.json()
        access_token = token_data.get("access_token")

        if not access_token:
            return JsonResponse({"error": "Failed to get token"}, status=400)

        request.session["github_token"] = access_token
        return HttpResponseRedirect(
            f"http://localhost:3000/github-success?token={access_token}"
        )


class ValidateGitHubRepoAccessView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        repo = request.data.get("repo")
        if not repo:
            return Response({"valid": False, "error": "Repo not specified"}, status=400)

        access_token = request.session.get("github_token")
        if not access_token:
            try:
                project_id = request.query_params.get("project_id")
                project = Project.objects.get(id=project_id, created_by=request.user)
                access_token = project.github_token
            except Project.DoesNotExist:
                return Response(
                    {"valid": False, "error": "Token not found"}, status=403
                )

        is_valid = validate_github_repo_access(access_token, repo)
        request.data.get("token") or request.session.get("github_token")
        return Response({"valid": is_valid})


@api_view(["GET"])
def github_user_info(request):
    token = request.GET.get("token")
    if not token:
        return Response({"error": "No token provided"}, status=400)

    response = requests.get(
        "https://api.github.com/user",
        headers={"Authorization": f"token {token}"},
        timeout=5,
    )
    if response.status_code == 200:
        return Response(response.json())
    return Response({"error": "Invalid token"}, status=401)
