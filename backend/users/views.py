from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import (
    User,
    PasswordResetOTP,
    EmailVerificationOTP,
    SubscriptionPlan,
    UserSubscription,
    SystemSetting,
)
from .serializers import (
    UserSerializer,
    SubscriptionPlanSerializer,
    UserSubscriptionSerializer,
    SystemSettingSerializer,
)
from django.utils import timezone
from django.conf import settings
import logging
import secrets
import datetime
from utils.email_service import send_email
from dj_rest_auth.app_settings import api_settings

from dj_rest_auth.registration.views import RegisterView
from dj_rest_auth.views import UserDetailsView, LoginView

logger = logging.getLogger(__name__)


class CustomLoginView(LoginView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        # Auto-populate username with email if missing so both auth backend lookups succeed cleanly
        if hasattr(request, 'data'):
            email = request.data.get('email')
            if email and not request.data.get('username'):
                if hasattr(request.data, '_mutable') and not request.data._mutable:
                    request.data._mutable = True
                    request.data['username'] = email
                    request.data._mutable = False
                elif isinstance(request.data, dict):
                    request.data['username'] = email

        response = super().post(request, *args, **kwargs)
        system_settings = SystemSetting.get_settings()
        if response.status_code == 200:
            email = request.data.get('email') or request.data.get('username')
            user = User.objects.filter(email=email).first() or User.objects.filter(username=email).first()
            if user:
                # Check email verification requirement (superadmins/staff exempt)
                if system_settings.require_email_verification and not user.is_verified and not (user.is_staff or user.is_superuser):
                    return Response(
                        {"error": "Email verification is required before login. Please verify your email first."},
                        status=status.HTTP_403_FORBIDDEN,
                    )
                # Check maintenance mode
                if system_settings.maintenance_mode and not (user.is_staff or user.is_superuser):
                    return Response(
                        {"error": f"Maintenance Mode Active: {system_settings.maintenance_message}"},
                        status=status.HTTP_503_SERVICE_UNAVAILABLE,
                    )
        return response


class PublicRegisterView(RegisterView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        system_settings = SystemSetting.get_settings()
        if not system_settings.allow_public_signup:
            return Response(
                {"error": "Public registration is currently disabled by administrator."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if hasattr(request, 'data'):
            email = request.data.get('email')
            if email:
                if not request.data.get('username'):
                    if hasattr(request.data, '_mutable') and not request.data._mutable:
                        request.data._mutable = True
                        request.data['username'] = email
                        request.data._mutable = False
                    elif isinstance(request.data, dict):
                        request.data['username'] = email
                password = request.data.get('password')
                if password:
                    if not request.data.get('password1'):
                        if hasattr(request.data, '_mutable') and not request.data._mutable:
                            request.data._mutable = True
                            request.data['password1'] = password
                            request.data['password2'] = password
                            request.data._mutable = False
                        elif isinstance(request.data, dict):
                            request.data['password1'] = password
                            request.data['password2'] = password

        response = super().post(request, *args, **kwargs)
        if response.status_code in (200, 201):
            email = request.data.get('email')
            user = User.objects.filter(email=email).first()
            if user:
                if system_settings.require_email_verification:
                    user.is_verified = False
                    user.save()
                    # Generate verification code
                    code = "".join([secrets.choice("0123456789") for _ in range(6)])
                    EmailVerificationOTP.objects.create(
                        user=user,
                        otp=code,
                        expires_at=timezone.now() + datetime.timedelta(minutes=15)
                    )
                    subject = "Verify your CatalogStudio Account"
                    msg = f"Hello {user.name or 'User'},\n\nYour CatalogStudio verification code is: {code}\n\nThis code expires in 15 minutes."
                    send_email(user.email, subject, msg)
                else:
                    user.is_verified = True
                    user.save()

        return response


class PublicUserDetailsView(UserDetailsView):
    permission_classes = [permissions.AllowAny]


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows admins to view, edit, suspend, and delete user accounts.
    """
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        return User.objects.all().order_by("-date_joined")


class RequestPasswordResetOTP(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        email = (request.data.get("email") or "").strip()
        if not email:
            return Response(
                {"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        generic_response = {"message": "If an account with that email exists, a password reset code has been sent."}

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Prevent user enumeration: Return identical success response
            return Response(generic_response, status=status.HTTP_200_OK)

        now = timezone.now()

        # Cooldown check: 60 seconds between requests
        recent_otp = PasswordResetOTP.objects.filter(
            user=user, created_at__gte=now - datetime.timedelta(seconds=60)
        ).first()
        if recent_otp:
            return Response(
                {"error": "Please wait 60 seconds before requesting another code."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        # Rate limit: Max 5 requests in 15 minutes
        requests_in_window = PasswordResetOTP.objects.filter(
            user=user, created_at__gte=now - datetime.timedelta(minutes=15)
        ).count()
        if requests_in_window >= 5:
            return Response(
                {"error": "Too many requests. Please try again after 15 minutes."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        # Generate cryptographically secure 6-digit OTP using secrets
        otp_code = "".join([secrets.choice("0123456789") for _ in range(6)])
        expiry = now + datetime.timedelta(minutes=5)

        # Save OTP
        PasswordResetOTP.objects.create(user=user, otp=otp_code, expires_at=expiry)

        from utils.email_templates import get_password_reset_html

        # Send Email
        subject = "Your Password Reset OTP"
        current_time = now.strftime("%Y-%m-%d %H:%M:%S")
        message = f"Hello {user.name or 'User'},\n\nYour OTP for password reset is: {otp_code}\n\nThis code expires in 5 minutes.\n\nTime: {current_time}"
        html_content = get_password_reset_html(
            user.name or "User", otp_code, current_time
        )

        send_email(user.email, subject, message, html_message=html_content)

        return Response(generic_response, status=status.HTTP_200_OK)


class ResetPasswordWithOTP(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        email = (request.data.get("email") or "").strip()
        otp = (request.data.get("otp") or "").strip()
        new_password = request.data.get("new_password")

        if not email or not otp or not new_password:
            return Response(
                {"error": "Email, OTP, and new password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(new_password) < 6:
            return Response(
                {"error": "New password must be at least 6 characters."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email)
            latest_otp = (
                PasswordResetOTP.objects.filter(user=user)
                .order_by("-created_at")
                .first()
            )

            if not latest_otp or not latest_otp.is_valid():
                return Response(
                    {"error": "Invalid or expired OTP. Please request a new code."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Check if OTP matches
            if latest_otp.otp != otp:
                latest_otp.attempts += 1
                latest_otp.save()
                remaining = max(0, 5 - latest_otp.attempts)
                if remaining == 0:
                    latest_otp.delete()
                    return Response(
                        {"error": "Maximum invalid attempts exceeded. This code has been invalidated."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                return Response(
                    {"error": f"Invalid verification code. {remaining} attempt(s) remaining."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Reset Password
            user.set_password(new_password)
            user.save()

            # Invalidate all OTPs for this user
            user.otps.all().delete()

            return Response(
                {"message": "Password has been reset successfully. Please sign in."},
                status=status.HTTP_200_OK,
            )

        except User.DoesNotExist:
            return Response(
                {"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST
            )


class RequestEmailVerificationOTP(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        email = (request.data.get("email") or "").strip()
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        generic_response = {"message": "If an unverified account exists with that email, a verification code has been sent."}
        user = User.objects.filter(email=email).first()
        if not user or user.is_verified:
            return Response(generic_response, status=status.HTTP_200_OK)

        now = timezone.now()
        recent = EmailVerificationOTP.objects.filter(user=user, created_at__gte=now - datetime.timedelta(seconds=60)).first()
        if recent:
            return Response({"error": "Please wait 60 seconds before requesting another code."}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        otp_code = "".join([secrets.choice("0123456789") for _ in range(6)])
        expiry = now + datetime.timedelta(minutes=15)
        EmailVerificationOTP.objects.create(user=user, otp=otp_code, expires_at=expiry)

        subject = "Verify Your CatalogStudio Email"
        msg = f"Hello {user.name or 'User'},\n\nYour verification code is: {otp_code}\n\nThis code expires in 15 minutes."
        send_email(user.email, subject, msg)

        return Response(generic_response, status=status.HTTP_200_OK)


class ConfirmEmailVerificationOTP(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        email = (request.data.get("email") or "").strip()
        otp = (request.data.get("otp") or "").strip()
        if not email or not otp:
            return Response({"error": "Email and verification code are required."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"error": "Invalid or expired verification code."}, status=status.HTTP_400_BAD_REQUEST)

        latest = EmailVerificationOTP.objects.filter(user=user).order_by("-created_at").first()
        if not latest or not latest.is_valid():
            return Response({"error": "Verification code is invalid or expired."}, status=status.HTTP_400_BAD_REQUEST)

        if latest.otp != otp:
            latest.attempts += 1
            latest.save()
            return Response({"error": "Invalid verification code."}, status=status.HTTP_400_BAD_REQUEST)

        user.is_verified = True
        user.save()
        user.verification_otps.all().delete()
        return Response({"message": "Email verified successfully! You can now log in."}, status=status.HTTP_200_OK)

class AdminSubscriptionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UserSubscription.objects.all().select_related('user', 'plan').order_by('-start_date')
    serializer_class = UserSubscriptionSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        print(f"DEBUG: AdminSubscriptionViewSet.get_queryset called by {self.request.user}")
        return super().get_queryset()


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

        # Send subscription confirmation email
        from utils.email_service import send_email
        from utils.email_templates import get_subscription_purchase_html
        
        subject = f"Your {plan.name} Subscription is Active!"
        html_message = get_subscription_purchase_html(
            name=request.user.name or "User",
            plan_name=plan.name,
            purchase_date=timezone.now(),
            end_date=subscription.end_date,
            features=plan.features
        )
        
        try:
            send_email(
                to_email=request.user.email,
                subject=subject,
                message=f"Thank you for purchasing the {plan.name}.",
                html_message=html_message
            )
        except Exception as e:
            logger.exception("Failed to send subscription email to %s", request.user.email)

        return Response({
            "message": f"Successfully upgraded to {plan.name}",
            "plan_name": plan.name,
            "end_date": subscription.end_date
        })


class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    queryset = SubscriptionPlan.objects.all().order_by('price')
    serializer_class = SubscriptionPlanSerializer

    def perform_authentication(self, request):
        try:
            super().perform_authentication(request)
        except Exception:
            from django.contrib.auth.models import AnonymousUser
            request._user = AnonymousUser()

    def get_permissions(self):
        if self.action in ['list', 'retrieve'] or self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def list(self, request, *args, **kwargs):
        try:
            if not SubscriptionPlan.objects.exists():
                default_plans = [
                    {
                        'name': 'Starter Plan',
                        'slug': 'starter',
                        'price': 0,
                        'currency': 'INR',
                        'features': {
                            'max_catalogs': 3,
                            'max_products': 50,
                            'custom_watermark': False,
                            'pdf_export': True,
                            'max_storage_mb': 500,
                            'ai_enabled': False,
                        },
                        'is_active': True,
                    },
                    {
                        'name': 'Growth Plan',
                        'slug': 'growth',
                        'price': 999,
                        'currency': 'INR',
                        'features': {
                            'max_catalogs': 15,
                            'max_products': 500,
                            'custom_watermark': True,
                            'pdf_export': True,
                            'max_storage_mb': 2048,
                            'ai_enabled': True,
                        },
                        'is_active': True,
                    },
                    {
                        'name': 'Pro Enterprise',
                        'slug': 'pro',
                        'price': 2499,
                        'currency': 'INR',
                        'features': {
                            'max_catalogs': 100,
                            'max_products': 5000,
                            'custom_watermark': True,
                            'pdf_export': True,
                            'max_storage_mb': 10240,
                            'ai_enabled': True,
                            'priority_support': True,
                        },
                        'is_active': True,
                    },
                ]
                for p in default_plans:
                    SubscriptionPlan.objects.get_or_create(slug=p['slug'], defaults=p)
        except Exception as e:
            print(f"Error checking default plans in list: {e}")

        user = getattr(request, 'user', None)
        is_admin = bool(
            user and 
            getattr(user, 'is_authenticated', False) and 
            (getattr(user, 'is_staff', False) or getattr(user, 'is_superuser', False))
        )

        if is_admin:
            qs = SubscriptionPlan.objects.all().order_by('price')
        else:
            qs = SubscriptionPlan.objects.filter(is_active=True).order_by('price')

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


from dj_rest_auth.views import LogoutView

class CustomLogoutView(LogoutView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        try:
            cookie_name = getattr(settings, "REST_AUTH", {}).get(
                "JWT_AUTH_COOKIE", "catstudio-auth"
            )
            refresh_cookie_name = getattr(settings, "REST_AUTH", {}).get(
                "JWT_AUTH_REFRESH_COOKIE", "catstudio-refresh-token"
            )
            response.delete_cookie(cookie_name, path="/")
            response.delete_cookie(refresh_cookie_name, path="/")
        except Exception as e:
            print(f"Error clearing cookies in logout: {e}")
        return response


class ForceLogoutView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        response = Response({"message": "Force logged out"}, status=status.HTTP_200_OK)
        try:
            cookie_name = getattr(settings, "REST_AUTH", {}).get(
                "JWT_AUTH_COOKIE", "catstudio-auth"
            )
            refresh_cookie_name = getattr(settings, "REST_AUTH", {}).get(
                "JWT_AUTH_REFRESH_COOKIE", "catstudio-refresh-token"
            )

            response.delete_cookie(cookie_name, path="/")
            response.delete_cookie(refresh_cookie_name, path="/")
        except Exception as e:
            print(f"Error clearing cookies: {e}")

        return response


class SystemSettingsView(APIView):
    permission_classes = [permissions.AllowAny]

    def perform_authentication(self, request):
        try:
            super().perform_authentication(request)
        except Exception:
            from django.contrib.auth.models import AnonymousUser
            request._user = AnonymousUser()

    def get(self, request):
        setting = SystemSetting.get_settings()
        serializer = SystemSettingSerializer(setting, context={'request': request})
        return Response(serializer.data)

    def patch(self, request):
        if not (request.user and request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser)):
            return Response(
                {"detail": "Admin authorization required."},
                status=status.HTTP_403_FORBIDDEN
            )
        setting = SystemSetting.get_settings()
        serializer = SystemSettingSerializer(setting, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminTestEmailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        recipient = (request.data.get("recipient_email") or "").strip() or request.user.email
        if not recipient:
            return Response(
                {"error": "Recipient email address is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        subject = "CatalogStudio: SMTP Delivery Test"
        now_str = timezone.now().strftime("%Y-%m-%d %H:%M:%S UTC")
        message = (
            f"This is a test email sent from CatalogStudio Admin Settings at {now_str}.\n\n"
            f"If you received this message, your mail configuration is operational!"
        )
        html_message = f"""
        <div style="font-family: Arial, sans-serif; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 8px;">
            <h2 style="color: #38bdf8; margin-top: 0;">CatalogStudio Mail Delivery Test</h2>
            <p>This is a verification test sent from your <strong>CatalogStudio Admin Settings</strong>.</p>
            <p style="background: #1e293b; padding: 12px; border-radius: 6px; font-family: monospace;">Server Timestamp: {now_str}</p>
            <p style="color: #4ade80; font-weight: bold;">&#10004; Your outgoing SMTP email server is working successfully!</p>
        </div>
        """

        success = send_email(recipient, subject, message, html_message=html_message)
        if success:
            return Response(
                {"message": f"Test email sent successfully to {recipient}!"},
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {
                    "error": "Failed to send test email. Please verify SMTP host, port, credentials, and TLS/SSL settings."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class AdminChangePasswordView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        if not new_password or len(new_password) < 6:
            return Response(
                {"error": "New password must be at least 6 characters."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user
        if current_password and not user.check_password(current_password):
            return Response(
                {"error": "Current password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save()
        return Response(
            {"message": "Admin password updated successfully."},
            status=status.HTTP_200_OK,
        )

