from django.contrib.auth import get_user_model
from adrf.viewsets import ViewSet
from rest_framework.response import Response
from asgiref.sync import sync_to_async
from drf_spectacular.utils import extend_schema

User = get_user_model()


class AsyncUserViewSet(ViewSet):

    @extend_schema()
    async def list(self, request):
        @sync_to_async
        def get_users():
            return list(User.objects.values("id", "username"))

        users = await get_users()
        print("Users in ViewSet:", users)

        return Response({"users": users})
