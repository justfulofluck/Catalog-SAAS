
from django.dispatch import receiver
from allauth.account.signals import user_signed_up
from django.conf import settings
from utils.email_service import send_email
from utils.email_templates import get_welcome_email_html


@receiver(user_signed_up)
def send_welcome_email(request, user, **kwargs):
    """
    Send a welcome email to the user upon successful registration.
    """
    subject = "Welcome to CatalogStudio!"
    user_name = user.name or user.username
    frontend_url = settings.FRONTEND_URL
    dashboard_url = f"{frontend_url}/dashboard"

    try:
        html_message = get_welcome_email_html(user_name, dashboard_url)
    except Exception as e:
        html_message = None

    message = f"""
    Hi {user_name},

    Welcome to CatalogStudio! We are thrilled to have you on board.
    Launch your workspace: {dashboard_url}

    Best regards,
    The CatalogStudio Team
    """

    if user.email:
        send_email(user.email, subject, message, html_message=html_message)

