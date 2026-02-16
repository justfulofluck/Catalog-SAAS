from django.contrib import admin
from .models import MediaItem

@admin.register(MediaItem)
class MediaItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'user', 'created_at')
    list_filter = ('type', 'user')
    search_fields = ('name',)
