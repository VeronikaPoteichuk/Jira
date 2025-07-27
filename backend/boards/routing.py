from django.urls import re_path
from .consumers import TaskHistoryConsumer

websocket_urlpatterns = [
    re_path(r"ws/tasks/(?P<task_id>\d+)/history/$", TaskHistoryConsumer.as_asgi()),
]
