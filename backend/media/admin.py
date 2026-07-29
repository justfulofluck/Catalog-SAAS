from django.contrib import admin
from .models import MediaItem, AdminAsset

@admin.register(MediaItem)
class MediaItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'user', 'created_at')
    list_filter = ('type', 'user')
    search_fields = ('name',)

@admin.register(AdminAsset)
class AdminAssetAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'created_at')
    list_filter = ('type',)
    search_fields = ('name',)
