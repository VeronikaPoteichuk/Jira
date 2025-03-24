FROM python:3.11-slim as base

# Устанавливаем системные зависимости
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    python3-venv && \
    rm -rf /var/lib/apt/lists/*

# Создаем виртуальное окружение
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Устанавливаем pip-tools для генерации requirements
RUN pip install --no-cache-dir pip-tools==7.4.1

WORKDIR /app

# Копируем .in файлы
COPY requirements.in requirements_tests.in ./

# Генерируем requirements.txt
RUN pip-compile --strip-extras requirements.in -o requirements.txt && \
    pip-compile --strip-extras requirements_tests.in -o requirements_tests.txt

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]

FROM base AS tests

RUN pip install --no-cache-dir -r requirements_tests.txt