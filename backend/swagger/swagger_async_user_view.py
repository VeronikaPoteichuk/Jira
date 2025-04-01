from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework import status


def swagger_user(view_class):
    return extend_schema(
        tags=["Users"],
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description="List of users",
                response={
                    "type": "object",
                    "properties": {
                        "users": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "id": {"type": "integer"},
                                    "username": {"type": "string"},
                                },
                            },
                        }
                    },
                },
            )
        },
    )(view_class)
