import logging

from django.conf import settings
from django.core.mail import get_connection, send_mail as django_send_mail

logger = logging.getLogger(__name__)


def get_email_connection_and_sender():
    """
    Checks if active SMTP settings exist in SystemSetting in the database.
    If so, returns a dynamic SMTP connection and sender email.
    Otherwise falls back to settings.py (.env / console).
    """
    try:
        from users.models import SystemSetting
        system_settings = SystemSetting.get_settings()
        if (
            system_settings.smtp_host
            and system_settings.smtp_user
            and system_settings.smtp_password
        ):
            connection = get_connection(
                backend="django.core.mail.backends.smtp.EmailBackend",
                host=system_settings.smtp_host,
                port=system_settings.smtp_port or 587,
                username=system_settings.smtp_user,
                password=system_settings.smtp_password,
                use_tls=system_settings.smtp_use_tls,
                use_ssl=system_settings.smtp_use_ssl,
                timeout=10,
            )
            from_email = (
                system_settings.smtp_default_from_email
                or system_settings.smtp_user
            )
            return connection, from_email
    except Exception as e:
        logger.warning("Could not read dynamic DB SMTP settings: %s", e)

    return None, settings.DEFAULT_FROM_EMAIL


def send_email(to_email, subject, message, html_message=None):
    """
    Send an email using dynamic DB SMTP if configured, or default settings backend.
    Supports both plain text and HTML content.
    """
    try:
        connection, from_email = get_email_connection_and_sender()
        django_send_mail(
            subject=subject,
            message=message,  # Plain text version
            from_email=from_email,
            recipient_list=[to_email],
            html_message=html_message or (message if "<html" in message else None),
            connection=connection,
            fail_silently=False,
        )
        logger.info("Email sent successfully to %s via %s", to_email, from_email)
        return True
    except Exception:
        logger.exception("Failed to send email to %s", to_email)
        return False