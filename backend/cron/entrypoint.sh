#!/bin/bash

if [[ $(python manage.py showmigrations | grep '\[ \]') ]]; then
    python manage.py migrate
fi

cron && tail -f /var/log/cron.log
