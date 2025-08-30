FROM python:3.13-slim AS base

RUN apt-get update && \ 
    pip install --no-cache-dir uv==0.6.4 && \
    apt-get install -y --no-install-recommends curl=8.14.1-2 && \
    uv venv /opt/venv && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /opt/venv

ENV PATH="/opt/venv/bin:$PATH"

RUN uv pip install --no-cache-dir pip-tools==7.4.1

WORKDIR /app

COPY requirements.lock ./

RUN uv pip install --no-cache-dir -r requirements.lock && \
    pip install --no-cache-dir debugpy==1.8.15

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate && python -m debugpy --listen 0.0.0.0:5678 manage.py runserver 0.0.0.0:8000"]

FROM base AS tests

WORKDIR /app

RUN set -e && apt-get update && \
    apt-get install -y --no-install-recommends git=1:2.47.2-0.2 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY requirements_test.lock ./

RUN uv pip install --no-cache-dir -r requirements_test.lock

COPY . .

CMD ["sh", "-c", "python manage.py migrate && pytest"]

FROM base AS cron

RUN apt-get update && \
    apt-get install -y --no-install-recommends cron=3.0pl1-197 dos2unix==7.5.2 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY . .
COPY cron/cronfile /etc/cron.d/cronfile
COPY cron/entrypoint.sh /entrypoint.sh

RUN dos2unix /entrypoint.sh && \
    chmod +x /entrypoint.sh && \
    chmod 0644 /etc/cron.d/cronfile && \
    touch /var/log/cron.log && \
    crontab /etc/cron.d/cronfile

ENTRYPOINT ["/entrypoint.sh"]
