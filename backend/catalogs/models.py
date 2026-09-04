from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid

class Theme(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=255)
    background_color = models.CharField(max_length=50)
    heading_color = models.CharField(max_length=50)
    body_color = models.CharField(max_length=50)
    accent_color = models.CharField(max_length=50)
    font_collection = models.JSONField(default=dict)
    preview_image = models.ImageField(upload_to='themes/', blank=True, null=True)

    def __str__(self):
        return self.name

class Catalog(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
    ]

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='catalogs')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    settings = models.JSONField(default=dict, blank=True)
    product_ids = models.JSONField(default=list, blank=True)
    selected_category_ids = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class CatalogPage(models.Model):
    TYPE_CHOICES = [
        ('cover', 'Cover'),
        ('interior', 'Interior'),
        ('index', 'Index'),
        ('closing', 'Closing'),
    ]

    catalog = models.ForeignKey(Catalog, on_delete=models.CASCADE, related_name='pages')
    page_number = models.IntegerField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='interior')
    layout_data = models.JSONField(default=dict)
    category = models.ForeignKey('products.Category', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['page_number']

    def __str__(self):
        return f"{self.catalog.name} - Page {self.page_number}"

class SystemTemplate(models.Model):
    TEMPLATE_TYPES = [
        ('full_catalog', 'Full Catalog Blueprint'),
        ('cover', 'Cover Page Template'),
        ('product_grid', 'Product Grid Layout'),
        ('header', 'Master Header Template'),
        ('footer', 'Master Footer Template'),
    ]

    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100, default='General')
    type = models.CharField(max_length=50, choices=TEMPLATE_TYPES, default='full_catalog')
    description = models.TextField(blank=True, default='')
    thumbnail = models.TextField(blank=True, default='')
    theme_id = models.CharField(max_length=100, blank=True, default='modern-slate')
    pages_data = models.JSONField(default=list, blank=True)
    grid_data = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.type}] {self.name} ({self.category})"
