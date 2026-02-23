
from django.core.mail import send_mail as django_send_mail
from django.conf import settings

def send_email(to_email, subject, message, html_message=None):
    """
    Send an email using Django's backend.
    Supports both plain text and HTML content.
    """
    try:
        django_send_mail(
            subject=subject,
            message=message, # Plain text version
            from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else settings.EMAIL_HOST_USER,
            recipient_list=[to_email],
            html_message=html_message or (message if '<html' in message else None), # Auto-detect HTML if not explicitly provided
            fail_silently=False,
        )
        print(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        return False
