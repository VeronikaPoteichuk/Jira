from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import get_user_model

User = get_user_model()


@api_view(["GET"])
def test_user(request):
    users = User.objects.all()
    data = [{"id": user.id, "username": user.username} for user in users]
    return Response(data)
