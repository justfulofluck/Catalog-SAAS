
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import datetime

class User(AbstractUser):
    name = models.CharField(max_length=255, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    business_name = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.email

class PasswordResetOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otps')
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    def is_valid(self):
        return timezone.now() < self.expires_at


class SubscriptionPlan(models.Model):
    TIER_CHOICES = (
        ('starter', 'Starter'),
        ('growth', 'Growth'),
        ('pro', 'Pro'),
    )
    name = models.CharField(max_length=50)
    slug = models.SlugField(unique=True) 
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')
    features = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.price} {self.currency})"

class UserSubscription(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.email} - {self.plan.name}"


class SystemSetting(models.Model):
    platform_name = models.CharField(max_length=100, default="catalogmakerr.")
    support_email = models.EmailField(default="support@catalogstudio.com")
    allow_public_signup = models.BooleanField(default=True)
    maintenance_mode = models.BooleanField(default=False)
    maintenance_message = models.TextField(
        default="System is currently under maintenance. We will be back shortly."
    )
    enable_free_watermark = models.BooleanField(default=True)
    watermark_text = models.CharField(max_length=200, default="Made with catalogmakerr.")
    default_currency = models.CharField(max_length=3, default="INR")
    updated_at = models.DateTimeField(auto_now=True)

    @classmethod
    def get_settings(cls):
        setting, _ = cls.objects.get_or_create(id=1)
        return setting

    def __str__(self):
        return f"System Settings ({self.platform_name})"

