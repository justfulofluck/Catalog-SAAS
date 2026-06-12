import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User, SubscriptionPlan, UserSubscription
from django.utils import timezone
import datetime

# Create starter plan if it doesn't exist
plan, _ = SubscriptionPlan.objects.get_or_create(
    slug='starter',
    defaults={
        'name': 'Starter',
        'price': 0,
        'currency': 'INR',
        'features': {'max_catalogs': 1, 'max_products': 50}
    }
)

# Create the user
email = 'bhavanbadhe@gmail.com'
password = 'bhavan@123'

try:
    user = User.objects.get(email=email)
    print(f"User {email} already exists")
    user.set_password(password)
    user.name = 'Bhavan'
    user.business_name = 'Test Business'
    user.save()
    print("Password updated")
except User.DoesNotExist:
    user = User.objects.create_user(
        email=email,
        username=email,
        password=password,
        name='Bhavan',
        business_name='Test Business'
    )
    print(f"Created user: {email}")

# Ensure subscription exists
subscription, _ = UserSubscription.objects.get_or_create(
    user=user,
    defaults={
        'plan': plan,
        'end_date': timezone.now() + datetime.timedelta(days=7)
    }
)

print(f"User ready: {email} / {password}")
