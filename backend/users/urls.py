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
)

router = DefaultRouter()
router.register(r"users", UserViewSet)
router.register(r"plans", SubscriptionPlanViewSet)
router.register(r"admin-subscriptions", AdminSubscriptionViewSet, basename="admin-subscriptions")


urlpatterns = [
    path("", include(router.urls)),
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
    path("users/force-logout/", ForceLogoutView.as_view(), name="force-logout"),
    path("subscriptions/update/", UpdateSubscriptionView.as_view(), name="update-subscription"),
    path("users/system-settings/", SystemSettingsView.as_view(), name="system-settings"),
    path("users/change-admin-password/", AdminChangePasswordView.as_view(), name="admin-change-password"),
]
