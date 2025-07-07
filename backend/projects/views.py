from rest_framework.viewsets import ModelViewSet
from .models import Project
from .serializers import ProjectSerializer


class ProjectViewSet(ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
