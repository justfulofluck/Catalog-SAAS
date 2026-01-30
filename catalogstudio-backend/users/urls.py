from django.urls import path
from .views import LoginView, MeView, RegisterView, PasswordResetRequestView, PasswordResetVerifyView, PasswordResetConfirmView

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/me/', MeView.as_view(), name='me'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/password/reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('auth/password/reset/verify/', PasswordResetVerifyView.as_view(), name='password_reset_verify'),
    path('auth/password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]
