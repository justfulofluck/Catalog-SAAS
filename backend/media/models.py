import re, os
from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid

def sanitize_business_name(name):
    s = (name or 'unknown').strip().lower()
    s = re.sub(r'[^a-z0-9]+', '_', s)
    return s.strip('_') or 'unknown'

def media_upload_path(instance, filename):
    biz = sanitize_business_name(instance.user.business_name) if instance.user else 'unknown'
    ext = os.path.splitext(filename)[1].lower()
    if ext in ('.mp4', '.webm', '.mov', '.avi', '.mkv'):
        sub = 'videos'
    elif ext in ('.mp3', '.wav', '.ogg', '.aac', '.flac'):
        sub = 'audio'
    else:
        sub = 'images'
    return f'{biz}/library/{sub}/{filename}'

class MediaItem(models.Model):
    MEDIA_TYPES = [
        ('image', 'Image'),
        ('video', 'Video'),
        ('audio', 'Audio'),
    ]

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='media_items')
    file = models.FileField(upload_to=media_upload_path)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50, choices=MEDIA_TYPES, default='image')
    width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)
    size_bytes = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name
