from django.contrib import admin
from .models import Category, Product

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'rank', 'product_count')
    ordering = ('rank',)
    search_fields = ('name',)

    def product_count(self, obj):
        return obj.products.count()

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'price', 'category', 'updated_at')
    list_filter = ('category',)
    search_fields = ('name', 'sku')
