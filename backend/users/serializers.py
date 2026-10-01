from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer
from .models import User, SubscriptionPlan, UserSubscription
from django.utils import timezone
import datetime

class CustomRegisterSerializer(RegisterSerializer):
    name = serializers.CharField(required=False, allow_blank=True)
    business_name = serializers.CharField(required=False, allow_blank=True)
    plan_slug = serializers.CharField(required=False, allow_blank=True)

    def get_cleaned_data(self):
        data_dict = super().get_cleaned_data()
        data_dict['name'] = self.validated_data.get('name', '')
        data_dict['business_name'] = self.validated_data.get('business_name', '')
        data_dict['plan_slug'] = self.validated_data.get('plan_slug', 'starter')
        return data_dict

    def custom_signup(self, request, user):
        user.name = self.validated_data.get('name', '')
        user.business_name = self.validated_data.get('business_name', '')
        user.save(update_fields=['name', 'business_name'])
        
        # Handle Subscription
        plan_slug = self.validated_data.get('plan_slug', 'starter')
        plan = SubscriptionPlan.objects.filter(slug=plan_slug).first() or SubscriptionPlan.objects.filter(slug='starter').first()
        if not plan:
            plan = SubscriptionPlan.objects.create(
                name='Starter Plan',
                slug='starter',
                price=0,
                currency='INR',
                features={
                    "max_catalogs": 3,
                    "max_products": 50,
                    "custom_watermark": False,
                    "pdf_export": True
                },
                is_active=True
            )
            
        end_date = None
        if plan.slug == 'starter':
            end_date = timezone.now() + datetime.timedelta(days=7)
        else:
            end_date = timezone.now() + datetime.timedelta(days=30)
            
        UserSubscription.objects.get_or_create(
            user=user,
            defaults={
                'plan': plan,
                'end_date': end_date,
                'is_active': True
            }
        )

class UserSerializer(serializers.ModelSerializer):
    subscription_plan = serializers.CharField(source='subscription.plan.name', read_only=True)
    subscription_end_date = serializers.DateTimeField(source='subscription.end_date', read_only=True)
    subscription_features = serializers.JSONField(source='subscription.plan.features', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'avatar', 'is_verified', 'business_name', 'is_staff', 'is_superuser', 
                  'date_joined', 'is_active', 'subscription_plan', 'subscription_end_date', 'subscription_features')
        read_only_fields = ('email', 'is_verified', 'date_joined')

class UserSubscriptionSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    
    class Meta:
        model = UserSubscription
        fields = ('id', 'user', 'user_email', 'user_name', 'plan', 'plan_name', 'start_date', 'end_date', 'is_active')
        read_only_fields = ('start_date',)

from .models import User, SubscriptionPlan, UserSubscription, SystemSetting

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'


class SystemSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSetting
        fields = '__all__'



