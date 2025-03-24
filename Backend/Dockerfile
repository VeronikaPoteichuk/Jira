FROM python:3.11-slim as base

# Устанавливаем системные зависимости
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    python3-venv && \
    rm -rf /var/lib/apt/lists/*

# Создаем виртуальное окружение и устанавливаем uv
RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir --upgrade pip && \
    /opt/venv/bin/pip install --no-cache-dir uv==0.6.4

ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

COPY requirements.txt .

RUN /opt/venv/bin/python -m pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver "]

FROM base AS tests

WORKDIR /app

RUN set -e && apt-get update && \
    apt-get install -y --no-install-recommends git=1:2.39.5-0+deb12u2 && \
    uv pip install --no-cache-dir pip-tools==7.4.1 pre-commit==4.1.0 && \
    rm -rf /var/lib/apt/lists/* && \
    git config --global --add safe.directory /app

COPY requirements.txt requirements_tests.txt ./

RUN uv pip install --no-cache-dir -r requirements.txt && \
    uv pip install --no-cache-dir -r requirements_tests.txt
