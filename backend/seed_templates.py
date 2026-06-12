import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import BusinessTemplate

templates = [
    {'id': 'fashion', 'name': 'Fashion Retail', 'description': 'Fashion and apparel catalog template', 'schema': ['name', 'price', 'sku', 'color', 'size', 'material']},
    {'id': 'electronics', 'name': 'Electronics', 'description': 'Electronics and gadgets template', 'schema': ['name', 'price', 'sku', 'brand', 'warranty', 'specs']},
    {'id': 'furniture', 'name': 'Furniture & Home', 'description': 'Furniture and home decor template', 'schema': ['name', 'price', 'sku', 'dimensions', 'material', 'weight']},
    {'id': 'food', 'name': 'Food & Beverage', 'description': 'Food and beverage catalog template', 'schema': ['name', 'price', 'sku', 'ingredients', 'expiry', 'weight']}
]

for t in templates:
    obj, created = BusinessTemplate.objects.update_or_create(
        id=t['id'],
        defaults={'name': t['name'], 'description': t['description'], 'schema': t['schema']}
    )
    print(f"Template {t['id']}: {'created' if created else 'updated'}")
