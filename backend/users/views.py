from django.contrib.auth import get_user_model
from adrf.viewsets import ModelViewSet
from .serializers import UserSerializer, UserCreateSerializer, UserUpdateSerializer
from rest_framework.response import Response
from rest_framework import status
from asgiref.sync import sync_to_async
from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny, IsAuthenticated

User = get_user_model()


class AsyncUserViewSet(ModelViewSet):
    queryset = User.objects.all()

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        elif self.action == "update" or self.action == "partial_update":
            return UserUpdateSerializer
        return UserSerializer

    async def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        await sync_to_async(serializer.is_valid, thread_sensitive=True)(
            raise_exception=True
        )
        user = await sync_to_async(serializer.save, thread_sensitive=True)()
        read_serializer = UserSerializer(user)
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)

    async def update(self, request, *args, **kwargs):
        instance = await sync_to_async(self.get_object, thread_sensitive=True)()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        await sync_to_async(serializer.is_valid, thread_sensitive=True)(
            raise_exception=True
        )
        updated_user = await sync_to_async(serializer.save, thread_sensitive=True)()
        return Response(UserUpdateSerializer(updated_user).data)

    async def destroy(self, request, *args, **kwargs):
        try:
            instance = await sync_to_async(self.get_object, thread_sensitive=True)()
        except User.DoesNotExist:
            raise NotFound("User not found.")
        await sync_to_async(instance.delete, thread_sensitive=True)()
        return Response(status=status.HTTP_204_NO_CONTENT)


# from rest_framework_simplejwt.tokens import RefreshToken
# from rest_framework.exceptions import AuthenticationFailed
# from django.contrib.auth import get_user_model
# from rest_framework import status
# from rest_framework.response import Response
# from adrf.views import APIView
# from django.contrib.auth import authenticate
# from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
# from rest_framework.permissions import AllowAny

# class AsyncLoginView(APIView):
#     permission_classes = [AllowAny]

#     async def post(self, request, *args, **kwargs):
#         username = request.data.get('username')
#         password = request.data.get('password')

#         if not username or not password:
#             raise AuthenticationFailed("Username and password are required.")

#         user = await self.authenticate_user(username, password)

#         if not user:
#             raise AuthenticationFailed("Invalid credentials.")

#         refresh = RefreshToken.for_user(user)
#         access_token = refresh.access_token

#         return Response({
#             'refresh': str(refresh),
#             'access': str(access_token),
#         })

#     async def authenticate_user(self, username, password):
#         """
#         Асинхронно аутентифицирует пользователя.
#         """
#         loop = asyncio.get_event_loop()
#         user = await loop.run_in_executor(None, lambda: authenticate(username=username, password=password))
#         return user


# from rest_framework_simplejwt.tokens import AccessToken
# from rest_framework.exceptions import AuthenticationFailed
# from adrf.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from asgiref.sync import sync_to_async
# from django.contrib.auth import get_user_model

# User = get_user_model()

# class AsyncTokenAuthView(APIView):
#     authentication_classes = []
#     permission_classes = []

#     async def post(self, request, *args, **kwargs):
#         token_str = request.data.get("token")
#         if not token_str:
#             raise AuthenticationFailed("Token is required.")

#         try:
#             token = await sync_to_async(AccessToken)(token_str)
#             user_id = token.get("user_id")
#             user = await sync_to_async(User.objects.aget)(id=user_id)
#         except Exception as e:
#             raise AuthenticationFailed(f"Invalid token: {str(e)}")

#         serializer = UserSerializer(user)
#         return Response(serializer.data)


# from rest_framework.generics import GenericAPIView
# from rest_framework.response import Response
# from rest_framework.permissions import AllowAny
# from rest_framework import status
# from .serializers import RegisterSerializer

# class AsyncRegisterView(GenericAPIView):
#     permission_classes = [AllowAny]
#     serializer_class = RegisterSerializer

#     async def post(self, request):
#         serializer = self.get_serializer(data=request.data)
#         await sync_to_async(serializer.is_valid, thread_sensitive=True)(raise_exception=True)
#         await sync_to_async(serializer.save, thread_sensitive=True)()
#         return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)


# class AsyncLoginView(APIView):
#     permission_classes = [AllowAny]

#     async def post(self, request):
#         username = request.data.get("username")
#         password = request.data.get("password")

#         user = await sync_to_async(authenticate, thread_sensitive=True)(username=username, password=password)

#         if user is not None:
#             refresh = await sync_to_async(RefreshToken.for_user, thread_sensitive=True)(user)
#             return Response({
#                 "refresh": str(refresh),
#                 "access": str(refresh.access_token),
#             }, status=status.HTTP_200_OK)
#         else:
#             return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
