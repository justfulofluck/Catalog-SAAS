import logging

from django.conf import settings
from django.core.mail import send_mail as django_send_mail

logger = logging.getLogger(__name__)


def send_email(to_email, subject, message, html_message=None):
    """
    Send an email using Django's backend.
    Supports both plain text and HTML content.
    """
    try:
        django_send_mail(
            subject=subject,
            message=message,  # Plain text version
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            html_message=html_message or (message if "<html" in message else None),  # Auto-detect HTML if not explicitly provided
            fail_silently=False,
        )
        logger.info("Email sent successfully to %s", to_email)
        return True
    except Exception:
        logger.exception("Failed to send email to %s", to_email)
        return False