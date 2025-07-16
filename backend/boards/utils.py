import requests
from django.conf import settings

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
