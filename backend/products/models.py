from django.db import models
from django.utils import timezone
import uuid

from django.conf import settings

def category_image_path(instance, filename):
    if not instance.user or instance.user.is_staff or instance.user.is_superuser:
        return f'admin_media/categories/{filename}'
    return f'user_media/{instance.user.id}/categories/{filename}'

def product_image_path(instance, filename):
    if not instance.user or instance.user.is_staff or instance.user.is_superuser:
        return f'admin_media/products/{filename}'
    return f'user_media/{instance.user.id}/products/{filename}'

class Category(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='categories', null=True, blank=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    rank = models.IntegerField(default=0)
    color = models.CharField(max_length=7, default='#000000')
    thumbnail = models.ImageField(upload_to=category_image_path, blank=True, null=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subcategories')
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['rank']

    def __str__(self):
        return self.name

class Product(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='products', null=True, blank=True)
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, db_index=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to=product_image_path, blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
