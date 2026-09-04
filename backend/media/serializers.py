from rest_framework import serializers
from .models import MediaItem, AdminAsset

class MediaItemSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    
    class Meta:
        model = MediaItem
        fields = ('id', 'uuid', 'name', 'type', 'url', 'file', 'width', 'height', 'size_bytes', 'created_at')
        read_only_fields = ('uuid', 'created_at', 'width', 'height', 'size_bytes', 'type')
        extra_kwargs = {
            'file': {'write_only': True, 'required': False},
            'name': {'required': False}
        }

    def get_url(self, obj):
        request = self.context.get('request')
        if obj.file:
            return request.build_absolute_uri(obj.file.url)
        return None
        
    def create(self, validated_data):
        if 'request' in self.context:
            validated_data['user'] = self.context['request'].user
        
        file = validated_data.get('file')
        if file:
            if not validated_data.get('name'):
                validated_data['name'] = file.name
            validated_data['size_bytes'] = file.size
        return super().create(validated_data)

class AdminAssetSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    
    class Meta:
        model = AdminAsset
        fields = ('id', 'uuid', 'name', 'type', 'url', 'width', 'height', 'size_bytes', 'created_at')
        read_only_fields = ('uuid', 'created_at', 'width', 'height', 'size_bytes', 'type')

    def get_url(self, obj):
        request = self.context.get('request')
        if obj.file:
            return request.build_absolute_uri(obj.file.url)
        return None
