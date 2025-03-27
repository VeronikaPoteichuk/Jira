from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from asgiref.sync import sync_to_async
from asgiref.sync import async_to_sync

User = get_user_model()


class AsyncUserView(APIView):
    @sync_to_async
    def get_users(self):
        return list(User.objects.values("id", "username"))

    def get(self, request):
        @async_to_sync
        async def async_get():
            users = await self.get_users()
            return Response({"users": users})

        return async_get()
