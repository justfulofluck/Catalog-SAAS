from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid

def media_upload_path(instance, filename):
    if instance.user.is_staff or instance.user.is_superuser:
        return f'admin_media/uploads/{filename}'
    return f'user_media/{instance.user.id}/uploads/{filename}'

class MediaItem(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='media_items')
    file = models.ImageField(upload_to=media_upload_path)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50, default='image')
    width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)
    size_bytes = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name
