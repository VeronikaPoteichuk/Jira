from rest_framework_nested.routers import DefaultRouter, NestedDefaultRouter
from .views import BoardViewSet, ColumnViewSet, TaskViewSet, CommentViewSet

router = DefaultRouter()
router.register("boards", BoardViewSet, basename="board")
router.register("columns", ColumnViewSet, basename="column")
router.register("tasks", TaskViewSet, basename="task")
tasks_router = NestedDefaultRouter(router, "tasks", lookup="task")
tasks_router.register("comments", CommentViewSet, basename="task-comments")

urlpatterns = router.urls + tasks_router.urls
