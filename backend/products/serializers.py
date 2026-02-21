from rest_framework import serializers
from .models import Category, Product

class CategorySerializer(serializers.ModelSerializer):
    parent_name = serializers.ReadOnlyField(source='parent.name')

    class Meta:
        model = Category
        fields = ['id', 'uuid', 'user', 'name', 'description', 'rank', 'color', 'thumbnail', 'parent', 'parent_name', 'created_at']

class ProductSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)

    class Meta:
        model = Product
        fields = '__all__'
