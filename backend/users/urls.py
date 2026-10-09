from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet,
    RequestPasswordResetOTP,
    ResetPasswordWithOTP,
    ForceLogoutView,
    SubscriptionPlanViewSet,
    UpdateSubscriptionView,
    AdminSubscriptionViewSet,
    SystemSettingsView,
    AdminChangePasswordView,
    AdminTestEmailView,
    RequestEmailVerificationOTP,
    ConfirmEmailVerificationOTP,
    VerifyRegistrationTokenView,
    CompleteRegistrationAndOnboardingView,
    EnterpriseInquiryView,
)

router = DefaultRouter()
router.register(r"users", UserViewSet)
router.register(r"plans", SubscriptionPlanViewSet)
router.register(r"admin-subscriptions", AdminSubscriptionViewSet, basename="admin-subscriptions")


urlpatterns = [
    path("users/system-settings/", SystemSettingsView.as_view(), name="system-settings"),
    path("users/system-settings/test-email/", AdminTestEmailView.as_view(), name="system-settings-test-email"),
    path("users/force-logout/", ForceLogoutView.as_view(), name="force-logout"),
    path("users/change-admin-password/", AdminChangePasswordView.as_view(), name="admin-change-password"),
    path("subscriptions/update/", UpdateSubscriptionView.as_view(), name="update-subscription"),
    path("enterprise-inquiry/", EnterpriseInquiryView.as_view(), name="enterprise-inquiry"),
    path(
        "auth/password-reset/otp/request/",
        RequestPasswordResetOTP.as_view(),
        name="password-reset-otp-request",
    ),
    path(
        "auth/password-reset/otp/confirm/",
        ResetPasswordWithOTP.as_view(),
        name="password-reset-otp-confirm",
    ),
    path(
        "auth/email-verification/request/",
        RequestEmailVerificationOTP.as_view(),
        name="email-verification-request",
    ),
    path(
        "auth/email-verification/confirm/",
        ConfirmEmailVerificationOTP.as_view(),
        name="email-verification-confirm",
    ),
    path(
        "auth/registration/verify-token/",
        VerifyRegistrationTokenView.as_view(),
        name="registration-verify-token",
    ),
    path(
        "auth/registration/complete-onboarding/",
        CompleteRegistrationAndOnboardingView.as_view(),
        name="registration-complete-onboarding",
    ),
    path("", include(router.urls)),
]
