import json
import requests
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Task, TaskHistory


GITHUB_API = "https://api.github.com"


def create_github_branch(repo, branch_name, base_branch="main"):
    headers = {
        "Authorization": f"token {settings.GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
    }

    base_url = f"{GITHUB_API}/repos/{repo}/git/ref/heads/{base_branch}"
    base_res = requests.get(base_url, headers=headers, timeout=5)
    base_res.raise_for_status()
    sha = base_res.json()["object"]["sha"]

    create_url = f"{GITHUB_API}/repos/{repo}/git/refs"
    response = requests.post(
        create_url,
        headers=headers,
        json={"ref": f"refs/heads/feature/{branch_name}", "sha": sha},
        timeout=5,
    )
    response.raise_for_status()
    return {
        "url": f"https://github.com/{repo}/tree/feature/{branch_name}",
        "sha": sha,
    }


@csrf_exempt
def github_webhook(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid method"}, status=405)

    try:
        event = request.headers.get("X-GitHub-Event")
        payload = json.loads(request.body)
    except Exception:
        return JsonResponse({"error": "Invalid payload"}, status=400)

    print(f"GitHub Event: {event}")

    if event == "create" and payload.get("ref_type") == "branch":
        branch = payload.get("ref")
        task = Task.objects.filter(branch_name=branch).first()
        if task:
            TaskHistory.objects.create(
                task=task,
                action="Branch created",
                details=f"Branch <i>{branch}</i> created on GitHub",
                source="github",
            )

    elif event == "delete" and payload.get("ref_type") == "branch":
        branch = payload.get("ref")
        task = Task.objects.filter(branch_name=branch).first()
        if task:
            TaskHistory.objects.create(
                task=task,
                action="Branch deleted",
                details=f"Branch <i>{branch}<i> was deleted on GitHub",
                source="github",
            )

    elif event == "push":
        branch = payload.get("ref", "").replace("refs/heads/", "")
        commits = payload.get("commits", [])
        task = Task.objects.filter(branch_name=branch).first()

        if task and commits:
            for commit in commits:
                msg = commit.get("message", "")
                url = commit.get("url", "")
                author = commit.get("author", {}).get("name", "")
                TaskHistory.objects.create(
                    task=task,
                    action="Commit pushed",
                    details=f"{msg} by <strong>{author}</strong> <br> [View commit]({url})",
                    source="github",
                )

    elif event == "pull_request":
        action = payload.get("action")
        pr = payload.get("pull_request", {})
        branch = pr.get("head", {}).get("ref")
        title = pr.get("title")
        url = pr.get("html_url")
        task = Task.objects.filter(branch_name=branch).first()

        if task:
            if action == "synchronize":
                sender = payload.get("sender", {}).get("login", "unknown")
                TaskHistory.objects.create(
                    task=task,
                    action="Commit added to PR",
                    details=f"<strong>{sender}</strong> pushed new commit(s) to PR [{title}]({url})",
                    source="github",
                )
            else:
                TaskHistory.objects.create(
                    task=task,
                    action=f"PR {action}",
                    details=f"[{title}]({url})",
                    source="github",
                )

    elif event == "pull_request_review":
        action = payload.get("action")
        review = payload.get("review", {})
        pr = payload.get("pull_request", {})
        branch = pr.get("head", {}).get("ref")
        reviewer = review.get("user", {}).get("login", "someone")
        state = review.get("state")  # approved, changes_requested, commented
        url = review.get("html_url")
        task = Task.objects.filter(branch_name=branch).first()

        if task and action == "submitted":
            TaskHistory.objects.create(
                task=task,
                action="Review submitted",
                details=f"<strong>{reviewer}</strong> submitted a review ({state.upper()}) <br> [View review]({url})",
                source="github",
            )

    elif event == "pull_request_review_comment":
        action = payload.get("action")
        comment = payload.get("comment", {})
        pr = payload.get("pull_request", {})
        branch = pr.get("head", {}).get("ref")
        author = comment.get("user", {}).get("login", "someone")
        body = comment.get("body", "")
        url = comment.get("html_url", "")
        task = Task.objects.filter(branch_name=branch).first()

        if task and action == "created":
            TaskHistory.objects.create(
                task=task,
                action="Review comment",
                details=f"<strong>{author}</strong> commented in PR review: <i>{body}</i> <br> [View comment]({url})",
                source="github",
            )

    return JsonResponse({"status": "ok"})
