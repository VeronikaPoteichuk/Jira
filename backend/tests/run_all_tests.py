#!/usr/bin/env python3
import os
import sys
import subprocess  # nosec B404 - Used for running pytest, input is controlled


def main():
    os.environ["DJANGO_SETTINGS_MODULE"] = "jira.test_settings"
    os.environ["DJANGO_TESTING"] = "True"
    os.environ.get("FERNET_KEY")

    if len(sys.argv) > 1:
        cmd = ["python3", "-m", "pytest"] + sys.argv[1:]
    else:
        cmd = ["python3", "-m", "pytest"]

    try:
        result = subprocess.run(
            cmd, check=True
        )  # nosec B603 - Command is controlled, no shell=True
        return result.returncode
    except subprocess.CalledProcessError as e:
        return e.returncode
    except FileNotFoundError:
        print("Error: pytest not found. Please install pytest first.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
