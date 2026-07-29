import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import authenticate
from users.models import User

email = 'admin@admin.com'
password = 'admin@123'

# 1. Check if user exists
user = User.objects.filter(email=email).first()
if user:
    print(f"User exists: email={user.email}, username={user.username}, is_active={user.is_active}, is_staff={user.is_staff}, is_superuser={user.is_superuser}")
    # Check password directly
    match = user.check_password(password)
    print(f"Direct password check match: {match}")
else:
    print("User does not exist!")

# 2. Try authenticate using email
user_auth = authenticate(username=email, password=password)
print(f"Authenticate using username={email}: {user_auth}")

# 3. Try authenticate using username='admin' if any
user_auth_admin = authenticate(username='admin', password=password)
print(f"Authenticate using username=admin: {user_auth_admin}")
