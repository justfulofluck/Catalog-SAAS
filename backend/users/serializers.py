from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer
from .models import User, BusinessTemplate, SubscriptionPlan, UserSubscription
from django.utils import timezone
import datetime

class CustomRegisterSerializer(RegisterSerializer):
    name = serializers.CharField(required=False)
    business_name = serializers.CharField(required=False)
    plan_slug = serializers.CharField(required=False)

    def custom_signup(self, request, user):
        user.name = self.validated_data.get('name', '')
        user.business_name = self.validated_data.get('business_name', '')
        user.save(update_fields=['name', 'business_name'])
        
        # Handle Subscription
        plan_slug = self.validated_data.get('plan_slug', 'starter')
        try:
            plan = SubscriptionPlan.objects.get(slug=plan_slug)
        except SubscriptionPlan.DoesNotExist:
            # Fallback to starter if not found
            plan = SubscriptionPlan.objects.filter(slug='starter').first()
            
        if plan:
            end_date = None
            if plan.slug == 'starter':
                end_date = timezone.now() + datetime.timedelta(days=7)
                
            UserSubscription.objects.create(
                user=user,
                plan=plan,
                end_date=end_date
            )

class UserSerializer(serializers.ModelSerializer):
    subscription_plan = serializers.CharField(source='subscription.plan.name', read_only=True)
    subscription_end_date = serializers.DateTimeField(source='subscription.end_date', read_only=True)
    subscription_features = serializers.JSONField(source='subscription.plan.features', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'avatar', 'is_verified', 'business_name', 'business_id', 'is_staff', 'is_superuser', 
                  'date_joined', 'is_active', 'subscription_plan', 'subscription_end_date', 'subscription_features')
        read_only_fields = ('email', 'is_verified', 'is_staff', 'is_superuser')

class UserSubscriptionSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    
    class Meta:
        model = UserSubscription
        fields = ('id', 'user', 'user_email', 'user_name', 'plan', 'plan_name', 'start_date', 'end_date', 'is_active')
        read_only_fields = ('start_date',)

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = '__all__'

class BusinessTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessTemplate
        fields = '__all__'
