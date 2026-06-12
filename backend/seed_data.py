import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User
from products.models import Category, Product

user = User.objects.get(email='bhavanbadhe@gmail.com')

# Create categories (no slug field in model)
categories = [
    {'name': 'Men\'s Apparel', 'description': 'Men\'s clothing and accessories'},
    {'name': 'Women\'s Apparel', 'description': 'Women\'s clothing and accessories'},
    {'name': 'Accessories', 'description': 'Bags, shoes, and accessories'},
]

cat_objs = []
for cat_data in categories:
    cat, created = Category.objects.get_or_create(
        user=user,
        name=cat_data['name'],
        defaults={'description': cat_data['description']}
    )
    cat_objs.append(cat)
    print(f"Category: {cat.name} - {'created' if created else 'exists'}")

# Create products
products = [
    {
        'name': 'Classic White T-Shirt',
        'price': 29.99,
        'sku': 'TS-WHT-001',
        'category': cat_objs[0],
    },
    {
        'name': 'Black Denim Jeans',
        'price': 79.99,
        'sku': 'JN-BLK-001',
        'category': cat_objs[0],
    },
    {
        'name': 'Floral Summer Dress',
        'price': 59.99,
        'sku': 'DR-FLR-001',
        'category': cat_objs[1],
    },
    {
        'name': 'Leather Handbag',
        'price': 129.99,
        'sku': 'BG-LTH-001',
        'category': cat_objs[2],
    },
]

for prod_data in products:
    prod, created = Product.objects.get_or_create(
        user=user,
        sku=prod_data['sku'],
        defaults={
            'name': prod_data['name'],
            'price': prod_data['price'],
            'category': prod_data['category'],
            'currency': 'USD'
        }
    )
    print(f"Product: {prod.name} - {'created' if created else 'exists'}")

print("Done!")
