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

CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]

FROM base AS tests

WORKDIR /app

RUN set -e && apt-get update && \
    apt-get install -y --no-install-recommends git=1:2.39.5-0+deb12u2 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY requirements_test.lock ./

RUN uv pip install --no-cache-dir -r requirements_test.lock

COPY . .

CMD ["sh", "-c", "python manage.py migrate && pytest"]

FROM base as cron

RUN apt-get update && \
    apt-get install -y --no-install-recommends cron=3.0pl1-162 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY cronfile /etc/cron.d/mycron

COPY async_cron_task.py /app/async_cron_task.py
COPY sync_cron_task.py /app/sync_cron_task.py

RUN chmod 0644 /etc/cron.d/mycron && \
    crontab /etc/cron.d/mycron && \
    touch /var/log/cron.log && \
    echo 'cron.* /var/log/cron.log' >> /etc/rsyslog.conf

CMD ["cron", "-f"]
