FROM python:3.13-slim as base

RUN apt-get update && \
    pip install --no-cache-dir uv==0.6.4 && \
    apt-get install -y --no-install-recommends curl=7.88.1-10+deb12u12 && \
    uv venv /opt/venv && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /opt/venv

ENV PATH="/opt/venv/bin:$PATH"

RUN uv pip install --no-cache-dir pip-tools==7.4.1

WORKDIR /app

COPY requirements.lock ./

RUN uv pip install --no-cache-dir -r requirements.lock

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate && uvicorn jira.asgi:application --reload"]

FROM base AS tests

WORKDIR /app

RUN set -e && apt-get update && \
    apt-get install -y --no-install-recommends git=1:2.39.5-0+deb12u2 && \
    uv pip install --no-cache-dir pip-tools==7.4.1 pre-commit==4.1.0 && \
    uv venv /opt/venv && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /opt/venv

COPY requirements_test.lock ./

RUN uv pip install --no-cache-dir -r requirements_test.lock

CMD ["sh", "-c", "python manage.py migrate && pytest"]
