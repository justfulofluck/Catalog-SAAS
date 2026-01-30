import uuid
import os
from django.db import models

class MediaItem(models.Model):
    id = models.CharField(primary_key=True, max_length=50, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    file = models.ImageField(upload_to='uploads/')
    type = models.CharField(max_length=20, default='image')
    size = models.CharField(max_length=50, blank=True, null=True) # e.g. "1.2 MB"
    dimensions = models.CharField(max_length=50, blank=True, null=True) # e.g. "1920x1080"
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = str(uuid.uuid4())
        # Here we could auto-calculate size/dimensions if needed, using Pillow
        # But for now we rely on the client or simple basic extraction
        if self.file and not self.size:
             self.size = f"{self.file.size / 1024:.1f} KB"
        super().save(*args, **kwargs)

    @property
    def url(self):
        if self.file:
            return self.file.url
        return ""
