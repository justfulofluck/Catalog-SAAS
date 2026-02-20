from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import User, PasswordResetOTP, SubscriptionPlan, UserSubscription
from .serializers import UserSerializer, SubscriptionPlanSerializer, UserSubscriptionSerializer
from django.utils import timezone
from django.conf import settings
import random
import datetime
from utils.email_service import send_email
from dj_rest_auth.app_settings import api_settings

from dj_rest_auth.registration.views import RegisterView
from dj_rest_auth.views import UserDetailsView


class DebugJWTSettingsView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def get(self, request):
        return Response(
            {
                "USE_JWT": api_settings.USE_JWT,
                "JWT_AUTH_COOKIE": api_settings.JWT_AUTH_COOKIE,
                "JWT_AUTH_REFRESH_COOKIE": api_settings.JWT_AUTH_REFRESH_COOKIE,
                "JWT_AUTH_COOKIE_PATH": api_settings.JWT_AUTH_COOKIE_PATH,
                "JWT_AUTH_REFRESH_COOKIE_PATH": api_settings.JWT_AUTH_REFRESH_COOKIE_PATH,
                "JWT_AUTH_COOKIE_DOMAIN": api_settings.JWT_AUTH_COOKIE_DOMAIN,
                "JWT_AUTH_HTTPONLY": api_settings.JWT_AUTH_HTTPONLY,
                "JWT_AUTH_SECURE": api_settings.JWT_AUTH_SECURE,
                "JWT_AUTH_SAMESITE": api_settings.JWT_AUTH_SAMESITE,
                "JWT_AUTH_COOKIE_USE_CSRF": api_settings.JWT_AUTH_COOKIE_USE_CSRF,
                "JWT_AUTH_COOKIE_ENFORCE_CSRF_ON_UNAUTHENTICATED": api_settings.JWT_AUTH_COOKIE_ENFORCE_CSRF_ON_UNAUTHENTICATED,
            }
        )


class PublicRegisterView(RegisterView):
    permission_classes = [permissions.AllowAny]


class PublicUserDetailsView(UserDetailsView):
    permission_classes = [permissions.IsAuthenticated]


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """

    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see themselves unless they are staff
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)


class RequestPasswordResetOTP(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response(
                {"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "Email does not exist in the system."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Generate 6-digit OTP
        otp_code = "".join([str(random.randint(0, 9)) for _ in range(6)])
        # User requested 5 minute expiry
        expiry = timezone.now() + datetime.timedelta(minutes=5)

        # Save OTP
        PasswordResetOTP.objects.create(user=user, otp=otp_code, expires_at=expiry)

        from utils.email_templates import get_password_reset_html

        # Send Email
        subject = "Your Password Reset OTP"
        current_time = timezone.now().strftime("%Y-%m-%d %H:%M:%S")
        message = f"Hello {user.name or 'User'},\n\nYour OTP for password reset is: {otp_code}\n\nThis code expires in 5 minutes.\n\nTime: {current_time}"
        html_content = get_password_reset_html(
            user.name or "User", otp_code, current_time
        )

        if send_email(user.email, subject, message, html_message=html_content):
            return Response(
                {"message": "OTP sent to your email."}, status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"error": "Failed to send OTP email. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ResetPasswordWithOTP(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        new_password = request.data.get("new_password")

        if not email or not otp or not new_password:
            return Response(
                {"error": "Email, OTP, and new password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email)
            latest_otp = (
                PasswordResetOTP.objects.filter(user=user, otp=otp)
                .order_by("-created_at")
                .first()
            )

            if not latest_otp or not latest_otp.is_valid():
                return Response(
                    {"error": "Invalid or expired OTP"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Reset Password
            user.set_password(new_password)
            user.save()

            # Delete used OTPs (optional, or just latest)
            user.otps.all().delete()

            return Response(
                {"message": "Password has been reset successfully."},
                status=status.HTTP_200_OK,
            )

        except User.DoesNotExist:
            return Response(
                {"error": "Invalid request"}, status=status.HTTP_400_BAD_REQUEST
            )


from .models import BusinessTemplate
from .serializers import BusinessTemplateSerializer


class BusinessTemplateViewSet(viewsets.ModelViewSet):
    queryset = BusinessTemplate.objects.all()
    serializer_class = BusinessTemplateSerializer
    permission_classes = [permissions.AllowAny]


class AdminSubscriptionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UserSubscription.objects.all().select_related('user', 'plan').order_by('-start_date')
    serializer_class = UserSubscriptionSerializer
    permission_classes = [permissions.IsAdminUser]


class UpdateSubscriptionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan_slug = request.data.get('plan_slug')
        if not plan_slug:
            return Response({"error": "plan_slug is required"}, status=400)

        try:
            plan = SubscriptionPlan.objects.get(slug=plan_slug)
        except SubscriptionPlan.DoesNotExist:
            return Response({"error": "Plan not found"}, status=404)

        # In a real app, you would verify payment with Razorpay here.
        # For now, we simulate success.

        # Update or create subscription
        subscription, created = UserSubscription.objects.get_or_create(user=request.user, defaults={'plan': plan})
        
        if not created:
            subscription.plan = plan
            # Reset end date if it's a new trial or different plan
            if plan.slug == 'starter':
                subscription.end_date = timezone.now() + datetime.timedelta(days=7)
            else:
                # Paid plans - in real app, based on payment. For mock, set 30 days.
                subscription.end_date = timezone.now() + datetime.timedelta(days=30)
            subscription.save()
        else:
            # New subscription created via defaults, but we need to set end_date if starter
            if plan.slug == 'starter':
                subscription.end_date = timezone.now() + datetime.timedelta(days=7)
                subscription.save()
            else:
                subscription.end_date = timezone.now() + datetime.timedelta(days=30)
                subscription.save()

        return Response({
            "message": f"Successfully upgraded to {plan.name}",
            "plan_name": plan.name,
            "end_date": subscription.end_date
        })


class SubscriptionPlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.AllowAny]


class ForceLogoutView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        response = Response({"message": "Force logged out"}, status=status.HTTP_200_OK)
        try:
            # Attempt to delete cookies based on settings
            cookie_name = getattr(settings, "REST_AUTH", {}).get(
                "JWT_AUTH_COOKIE", "catstudio-auth"
            )
            refresh_cookie_name = getattr(settings, "REST_AUTH", {}).get(
                "JWT_AUTH_REFRESH_COOKIE", "catstudio-refresh-token"
            )

            response.delete_cookie(cookie_name)
            response.delete_cookie(refresh_cookie_name)
        except Exception as e:
            print(f"Error clearing cookies: {e}")

        return response
