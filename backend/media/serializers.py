from rest_framework import serializers
from .models import MediaItem

class MediaItemSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    
    class Meta:
        model = MediaItem
        fields = ('id', 'uuid', 'name', 'type', 'url', 'width', 'height', 'size_bytes', 'created_at')
        read_only_fields = ('uuid', 'created_at', 'width', 'height', 'size_bytes', 'type')

    def get_url(self, obj):
        request = self.context.get('request')
        if obj.file:
            return request.build_absolute_uri(obj.file.url)
        return None
        
    def create(self, validated_data):
        # Auto-populate user from request
        validated_data['user'] = self.context['request'].user
        # Basic type inference
        file = validated_data.get('file')
        if file:
             validated_data['size_bytes'] = file.size
             # You could add more logic here to detect image dimensions using Pillow
        return super().create(validated_data)
