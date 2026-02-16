from rest_framework import serializers
from .models import Catalog, CatalogPage, Theme

class ThemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Theme
        fields = '__all__'

class CatalogPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CatalogPage
        fields = ('id', 'page_number', 'type', 'layout_data', 'category')

class CatalogSerializer(serializers.ModelSerializer):
    pages = CatalogPageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Catalog
        fields = ('id', 'uuid', 'name', 'status', 'settings', 'product_ids', 'selected_category_ids', 'created_at', 'updated_at', 'pages')
        read_only_fields = ('uuid', 'created_at', 'updated_at')

class CatalogCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Catalog
        fields = ('id', 'name', 'settings')

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)
