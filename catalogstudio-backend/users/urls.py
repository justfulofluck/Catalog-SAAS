from django.urls import path
from .views import LoginView, MeView, RegisterView, PasswordResetRequestView, PasswordResetVerifyView, PasswordResetConfirmView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('me/', MeView.as_view(), name='me'),
    path('register/', RegisterView.as_view(), name='register'),
    path('password/reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('password/reset/verify/', PasswordResetVerifyView.as_view(), name='password_reset_verify'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]
