#!/bin/bash

env | grep -E '^DJANGO_SECRET_KEY=|^DB_' >> /etc/environment

if [[ $(python manage.py showmigrations | grep '\[ \]') ]]; then
    python manage.py migrate
fi

cron && tail -f /var/log/cron.log
