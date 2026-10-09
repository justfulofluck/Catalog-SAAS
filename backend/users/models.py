
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
    attempts = models.IntegerField(default=0)
    
    def is_valid(self):
        return timezone.now() < self.expires_at and self.attempts < 5


class EmailVerificationOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verification_otps')
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    attempts = models.IntegerField(default=0)

    def is_valid(self):
        return timezone.now() < self.expires_at and self.attempts < 5


class PendingRegistration(models.Model):
    token = models.CharField(max_length=128, unique=True, db_index=True)
    email = models.EmailField(db_index=True)
    name = models.CharField(max_length=255, blank=True)
    password_hash = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_completed = models.BooleanField(default=False)

    def is_valid(self):
        return not self.is_completed and timezone.now() < self.expires_at

    def __str__(self):
        return f"PendingRegistration: {self.email} (valid={self.is_valid()})"


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
    support_email = models.EmailField(default="support@catalogmakerr.com")
    allow_public_signup = models.BooleanField(default=True)
    maintenance_mode = models.BooleanField(default=False)
    maintenance_message = models.TextField(
        default="System is currently under maintenance. We will be back shortly."
    )
    enable_free_watermark = models.BooleanField(default=True)
    watermark_text = models.CharField(max_length=200, default="Made with catalogmakerr.")
    default_currency = models.CharField(max_length=3, default="INR")

    # SMTP / Mail Delivery Server Configuration
    smtp_host = models.CharField(max_length=255, blank=True, default="")
    smtp_port = models.IntegerField(default=587)
    smtp_user = models.CharField(max_length=255, blank=True, default="")
    smtp_password = models.CharField(max_length=255, blank=True, default="")
    smtp_use_tls = models.BooleanField(default=True)
    smtp_use_ssl = models.BooleanField(default=False)
    smtp_default_from_email = models.CharField(max_length=255, blank=True, default="")
    
    # Account & Verification Policy
    require_email_verification = models.BooleanField(default=False)

    updated_at = models.DateTimeField(auto_now=True)

    @classmethod
    def get_settings(cls):
        setting, _ = cls.objects.get_or_create(id=1)
        return setting

    def __str__(self):
        return f"System Settings ({self.platform_name})"

