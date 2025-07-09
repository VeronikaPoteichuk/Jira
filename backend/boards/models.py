from django.db import models
from django.db.models import Max
from django.conf import settings
from django.core.exceptions import ValidationError

from django.core.exceptions import ValidationError
from django.db.models import Max


class Board(models.Model):
    name = models.CharField(max_length=255)
    project = models.ForeignKey(
        "projects.Project", on_delete=models.CASCADE, related_name="boards"
    )
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Board: {self.name} (Project: {self.project.name})"


class Column(models.Model):
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name="columns")
    name = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"Column: {self.name} (Board: {self.board.name})"


from django.core.exceptions import ValidationError
from django.db.models import Max


class Task(models.Model):
    id_in_board = models.PositiveIntegerField()
    column = models.ForeignKey(Column, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="created_tasks",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    order = models.PositiveIntegerField(default=0)
    branch_name = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"Task #{self.id_in_board}: {self.title} in {self.column.name}"

    def save(self, *args, **kwargs):
        if not self.id_in_board:
            board = self.column.board
            last_id = (
                Task.objects.filter(column__board=board).aggregate(
                    max_id=Max("id_in_board")
                )["max_id"]
                or 0
            )
            self.id_in_board = last_id + 1
        self.full_clean()
        super().save(*args, **kwargs)

    def clean(self):
        if not self.column_id:
            return
        board = self.column.board
        existing = Task.objects.filter(
            column__board=board, id_in_board=self.id_in_board
        ).exclude(pk=self.pk)
        if existing.exists():
            raise ValidationError("id_in_board must be unique within the board.")


class Comment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Comment by {self.author} on {self.task}"
