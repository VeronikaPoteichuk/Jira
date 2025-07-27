import json
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Task, TaskHistory
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


GITHUB_API = "https://api.github.com"


def create_github_branch(repo, branch_name, token, base_branch="main"):
    headers = {
        "Authorization": f"token {token}",
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
        print(f"Branch create event: branch={payload.get('ref')}")
        branch = payload.get("ref")

        task = Task.objects.filter(branch_name=branch).first()

        if task:
            history = TaskHistory.objects.create(
                task=task,
                action="Branch created",
                details=f"Branch <i>{branch}</i> created on GitHub",
                source="github",
            )
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"task_{task.id}",
                {
                    "type": "send_history_update",
                    "data": {
                        "action": "Branch created",
                        "details": f"Branch <i>{branch}</i> created on GitHub",
                        "created_at": str(history.created_at),
                        "id": task.id,
                    },
                },
            )

    elif event == "delete" and payload.get("ref_type") == "branch":
        print(f"Branch delete event: branch={payload.get('ref')}")
        branch = payload.get("ref")

        task = Task.objects.filter(branch_name=branch).first()

        if task:
            history = TaskHistory.objects.create(
                task=task,
                action="Branch deleted",
                details=f"Branch <i>{branch}<i> was deleted on GitHub",
                source="github",
            )
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"task_{task.id}",
                {
                    "type": "send_history_update",
                    "data": {
                        "action": "Branch deleted",
                        "details": f"Branch <i>{branch}<i> was deleted on GitHub",
                        "created_at": str(history.created_at),
                        "id": task.id,
                    },
                },
            )

    elif event == "push":
        print(f"Push event: branch={payload.get('ref', '').replace('refs/heads/', '')}")
        branch = payload.get("ref", "").replace("refs/heads/", "")
        commits = payload.get("commits", [])

        task = Task.objects.filter(branch_name=branch).first()

        if task and commits:
            for commit in commits:
                msg = commit.get("message", "")
                url = commit.get("url", "")
                author = commit.get("author", {}).get("name", "")
                history = TaskHistory.objects.create(
                    task=task,
                    action="Commit pushed",
                    details=f"{msg} by <strong>{author}</strong> <br> [View commit]({url})",
                    source="github",
                )
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    f"task_{task.id}",
                    {
                        "type": "send_history_update",
                        "data": {
                            "action": "Commit pushed",
                            "details": f"{msg} by <strong>{author}</strong> <br> [View commit]({url})",
                            "created_at": str(history.created_at),
                            "id": task.id,
                        },
                    },
                )

    elif event == "pull_request":
        print(
            f"Pull request event: action={payload.get('action')}, branch={payload.get('pull_request', {}).get('head', {}).get('ref')}"
        )
        action = payload.get("action")
        pr = payload.get("pull_request", {})
        branch = pr.get("head", {}).get("ref")
        branch = branch.replace("refs/heads/", "")
        title = pr.get("title")
        url = pr.get("html_url")

        task = Task.objects.filter(branch_name=branch).first()

        if not task:
            print(f"No task found for branch: {branch}")
        if task:
            if action == "synchronize":
                sender = payload.get("sender", {}).get("login", "unknown")
                history = TaskHistory.objects.create(
                    task=task,
                    action="Commit added to PR",
                    details=f"<strong>{sender}</strong> pushed new commit(s) to PR [{title}]({url})",
                    source="github",
                )
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    f"task_{task.id}",
                    {
                        "type": "send_history_update",
                        "data": {
                            "action": "Commit added to PR",
                            "details": f"<strong>{sender}</strong> pushed new commit(s) to PR [{title}]({url})",
                            "created_at": str(history.created_at),
                            "id": task.id,
                        },
                    },
                )
            else:
                history = TaskHistory.objects.create(
                    task=task,
                    action=f"PR {action}",
                    details=f"[{title}]({url})",
                    source="github",
                )
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    f"task_{task.id}",
                    {
                        "type": "send_history_update",
                        "data": {
                            "action": f"PR {action}",
                            "details": f"[{title}]({url})",
                            "created_at": str(history.created_at),
                            "id": task.id,
                        },
                    },
                )

    elif event == "pull_request_review":
        action = payload.get("action")
        review = payload.get("review", {})
        pr = payload.get("pull_request", {})
        branch = pr.get("head", {}).get("ref", "")
        branch = branch.replace("refs/heads/", "")
        reviewer = review.get("user", {}).get("login", "someone")
        state = review.get("state")  # approved, changes_requested, commented
        url = review.get("html_url")
        comment = payload.get("comment", {})
        body = comment.get("body", "")

        print(f"PR review event: action={action}, branch={branch}, reviewer={reviewer}")

        task = Task.objects.filter(branch_name=branch).first()
        if not task:
            print(f"No task found for branch: {branch}")
        if (
            task
            and action == "submitted"
            and state in ("approved", "changes_requested")
        ):
            history = TaskHistory.objects.create(
                task=task,
                action="Review submitted",
                details=f"<strong>{reviewer}</strong> submitted a review ({state.upper()}) <br> [View review]({url})",
                source="github",
            )
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"task_{task.id}",
                {
                    "type": "send_history_update",
                    "data": {
                        "action": "Review submitted",
                        "details": f"<strong>{reviewer}</strong> submitted a review ({state.upper()}) <br> [View review]({url})",
                        "created_at": str(history.created_at),
                        "id": task.id,
                    },
                },
            )
        else:
            print(
                f"Event pull_request_review ignored — action={action}, task found? {bool(task)}"
            )

    elif event == "pull_request_review_comment":
        action = payload.get("action")
        comment = payload.get("comment", {})
        pr = payload.get("pull_request", {})
        branch = pr.get("head", {}).get("ref", "")
        branch = branch.replace("refs/heads/", "")
        author = comment.get("user", {}).get("login", "someone")
        body = comment.get("body", "")
        url = comment.get("html_url", "")

        print(
            f"PR review comment event: action={action}, branch={branch}, author={author}"
        )

        task = Task.objects.filter(branch_name=branch).first()

        if not task:
            print(f"No task found for branch: {branch}")
        if task and action == "created":
            history = TaskHistory.objects.create(
                task=task,
                action="Review comment",
                details=f"<strong>{author}</strong> commented in PR review: <i>{body}</i> <br> [View comment]({url})",
                source="github",
            )
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"task_{task.id}",
                {
                    "type": "send_history_update",
                    "data": {
                        "action": "Review comment",
                        "details": f"<strong>{author}</strong> commented in PR review: <i>{body}</i> <br> [View comment]({url})",
                        "created_at": str(history.created_at),
                        "id": task.id,
                    },
                },
            )

    elif event == "pull_request_review_thread":
        action = payload.get("action")  # "submitted", "resolved", "unresolved"
        thread = payload.get("thread", {})
        pr = payload.get("pull_request", {})
        branch = pr.get("head", {}).get("ref", "").replace("refs/heads/", "")

        comments = thread.get("comments", [])
        if not comments:
            print("No comments in review thread")
            return JsonResponse({"status": "ignored"})

        first_comment = comments[0]
        author = first_comment.get("user", {}).get("login", "someone")
        body = first_comment.get("body", "")
        url = first_comment.get("html_url", "")

        task = Task.objects.filter(branch_name=branch).first()
        if not task:
            print(f"No task found for branch: {branch}")
            return JsonResponse({"status": "not_found"})

        if action == "submitted":
            action_text = "Review thread submitted"
        elif action == "resolved":
            action_text = "Review thread resolved"
        elif action == "unresolved":
            action_text = "Review thread reopened"
        else:
            action_text = f"Thread event: {action}"

        history = TaskHistory.objects.create(
            task=task,
            action=action_text,
            details=f"<strong>{author}</strong>: <i>{body}</i> <br> [View thread]({url})",
            source="github",
        )

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"task_{task.id}",
            {
                "type": "send_history_update",
                "data": {
                    "action": action_text,
                    "details": f"<strong>{author}</strong>: <i>{body}</i> <br> [View thread]({url})",
                    "created_at": str(history.created_at),
                    "id": task.id,
                },
            },
        )

    return JsonResponse({"status": "ok"})
