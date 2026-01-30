from rest_framework import serializers
from .models import MediaItem

class MediaItemSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    thumbnailUrl = serializers.SerializerMethodField()

    class Meta:
        model = MediaItem
        fields = ['id', 'name', 'file', 'type', 'url', 'thumbnailUrl', 'size', 'dimensions', 'created_at']
        read_only_fields = ['id', 'created_at', 'size', 'dimensions']
        extra_kwargs = {'file': {'write_only': True}}

    def get_url(self, obj):
        request = self.context.get('request')
        if obj.file:
            return request.build_absolute_uri(obj.file.url)
        return ""

    def get_thumbnailUrl(self, obj):
        # specific logic for thumbnails can go here, for now return same url
        return self.get_url(obj)
