from rest_framework import serializers
from .models import Category, Product

class CategorySerializer(serializers.ModelSerializer):
    parent_name = serializers.ReadOnlyField(source='parent.name')
    subcategories = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'uuid', 'user', 'name', 'description', 'rank', 'color', 'thumbnail', 'parent', 'parent_name', 'subcategories', 'created_at']

    def get_subcategories(self, obj):
        if obj.parent:  # Only show subcategories for top-level categories
            return []
        return list(obj.subcategories.values_list('id', flat=True))

    def validate_parent(self, value):
        if value and value.parent:
            raise serializers.ValidationError("Cannot create sub-subcategory. Only one level of subcategory is allowed.")
        return value


class ProductSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)

    class Meta:
        model = Product
        fields = '__all__'
