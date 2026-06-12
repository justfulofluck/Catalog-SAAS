import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User
from products.models import Category, Product

user = User.objects.get(email='bhavanbadhe@gmail.com')

# Get existing categories
categories = {cat.name: cat for cat in Category.objects.filter(user=user)}

# More products
more_products = [
    # Men's Apparel
    {'name': 'Blue Oxford Shirt', 'price': 49.99, 'sku': 'SH-BLU-001', 'category': categories['Men\'s Apparel']},
    {'name': 'Grey Chinos Pants', 'price': 59.99, 'sku': 'PN-GRY-001', 'category': categories['Men\'s Apparel']},
    {'name': 'Black Leather Belt', 'price': 39.99, 'sku': 'BT-BLK-001', 'category': categories['Men\'s Apparel']},
    {'name': 'White Sneakers', 'price': 89.99, 'sku': 'SN-WHT-001', 'category': categories['Men\'s Apparel']},
    
    # Women's Apparel
    {'name': 'Black Blazer', 'price': 129.99, 'sku': 'BLZ-BLK-001', 'category': categories['Women\'s Apparel']},
    {'name': 'High-Waist Jeans', 'price': 69.99, 'sku': 'JN-HI-001', 'category': categories['Women\'s Apparel']},
    {'name': 'Silk Blouse', 'price': 79.99, 'sku': 'BL-SLK-001', 'category': categories['Women\'s Apparel']},
    {'name': 'Midi Skirt', 'price': 45.99, 'sku': 'SK-MID-001', 'category': categories['Women\'s Apparel']},
    
    # Accessories
    {'name': 'Round Sunglasses', 'price': 149.99, 'sku': 'SG-RND-001', 'category': categories['Accessories']},
    {'name': 'Gold Hoop Earrings', 'price': 55.99, 'sku': 'ER-HOOP-001', 'category': categories['Accessories']},
    {'name': 'Crossbody Bag', 'price': 89.99, 'sku': 'BG-CRS-001', 'category': categories['Accessories']},
    {'name': 'Wool Scarf', 'price': 35.99, 'sku': 'SC-WL-001', 'category': categories['Accessories']},
]

for prod_data in more_products:
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

print("Total products created!")
