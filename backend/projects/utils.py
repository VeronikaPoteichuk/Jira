import requests


def validate_github_repo_access(token: str, repo: str) -> bool:
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github+json",
    }
    url = f"https://api.github.com/repos/{repo}"
    res = requests.get(url, headers=headers, timeout=5)
    return res.status_code == 200
