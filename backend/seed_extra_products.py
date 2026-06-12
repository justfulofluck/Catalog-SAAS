import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User
from products.models import Category, Product

user = User.objects.get(email='bhavanbadhe@gmail.com')
categories = {cat.name: cat for cat in Category.objects.filter(user=user)}

# Even more products
extra_products = [
    # Men's Apparel
    {'name': 'Navy Polo Shirt', 'price': 39.99, 'sku': 'PL-NVY-001', 'category': categories['Men\'s Apparel']},
    {'name': 'Charcoal Suit', 'price': 249.99, 'sku': 'ST-CHR-001', 'category': categories['Men\'s Apparel']},
    {'name': 'Brown Dress Shoes', 'price': 129.99, 'sku': 'SH-BRN-001', 'category': categories['Men\'s Apparel']},
    {'name': 'Athletic Shorts', 'price': 29.99, 'sku': 'SH-ATH-001', 'category': categories['Men\'s Apparel']},
    {'name': 'Crewneck Sweater', 'price': 79.99, 'sku': 'SW-CRN-001', 'category': categories['Men\'s Apparel']},
    
    # Women's Apparel
    {'name': 'Red Wrap Dress', 'price': 89.99, 'sku': 'DR-RD-001', 'category': categories['Women\'s Apparel']},
    {'name': 'Black Ankle Boots', 'price': 119.99, 'sku': 'BT-BLK-001', 'category': categories['Women\'s Apparel']},
    {'name': 'White Button Down', 'price': 55.99, 'sku': 'SH-WHT-002', 'category': categories['Women\'s Apparel']},
    {'name': 'Cropped Cardigan', 'price': 49.99, 'sku': 'CD-CRP-001', 'category': categories['Women\'s Apparel']},
    {'name': 'Wide-Leg Trousers', 'price': 65.99, 'sku': 'TR-WDG-001', 'category': categories['Women\'s Apparel']},
    
    # Accessories
    {'name': 'Aviator Sunglasses', 'price': 139.99, 'sku': 'SG-AVI-001', 'category': categories['Accessories']},
    {'name': 'Statement Necklace', 'price': 69.99, 'sku': 'NK-STMT-001', 'category': categories['Accessories']},
    {'name': 'Bucket Hat', 'price': 28.99, 'sku': 'HT-BCK-001', 'category': categories['Accessories']},
    {'name': 'Ankle Socks Pack', 'price': 18.99, 'sku': 'SC-ANK-001', 'category': categories['Accessories']},
]

for prod_data in extra_products:
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
