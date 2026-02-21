
from django.dispatch import receiver
from allauth.account.signals import user_signed_up
from django.conf import settings
from utils.email_service import send_email

@receiver(user_signed_up)
def send_welcome_email(request, user, **kwargs):
    """
    Send a welcome email to the user upon successful registration.
    """
    from datetime import datetime
    
    subject = "Welcome to Catalog Studio!"
    
    user_name = user.name or user.username
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
    dashboard_url = f"{frontend_url}/dashboard"
    year = datetime.now().year
    
    # HTML Message
    html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome to Catalog Studio</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, Helvetica, sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6f8; padding: 40px 0;">
        <tr>
            <td align="center">

                <!-- Main Container -->
                <table width="600" cellpadding="0" cellspacing="0" border="0" 
                       style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.05);">

                    <!-- Header -->
                    <tr>
                        <td style="background-color:#1f2937; padding:20px; text-align:center;">
                            <h1 style="color:#ffffff; margin:0; font-size:22px;">
                                Welcome to Catalog Studio
                            </h1>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:30px; color:#333333; font-size:15px; line-height:1.6;">

                            <p style="margin-top:0;">
                                Hi <strong>{user_name}</strong>,
                            </p>

                            <p>
                                Welcome to <strong>Catalog Studio</strong>! We are thrilled to have you on board.
                            </p>

                            <p>
                                Get started by creating your first product catalog or inviting your team members.
                            </p>

                            <!-- CTA Button -->
                            <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:25px 0;">
                                <tr>
                                    <td align="center" bgcolor="#2563eb" style="border-radius:5px;">
                                        <a href="{dashboard_url}" 
                                           style="display:inline-block; padding:12px 24px; font-size:14px; color:#ffffff; text-decoration:none; font-weight:bold;">
                                            Go to Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p>
                                If you have any questions, feel free to reply to this email.
                            </p>

                            <p style="margin-bottom:0;">
                                Best regards,<br>
                                <strong>The Catalog Studio Team</strong>
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color:#f9fafb; padding:15px; text-align:center; font-size:12px; color:#888888;">
                            © {year} Catalog Studio. All rights reserved.
                        </td>
                    </tr>

                </table>
                <!-- End Main Container -->

            </td>
        </tr>
    </table>

</body>
</html>
    """

    # Plain text fallback
    message = f"""
    Hi {user_name},
    
    Welcome to Catalog Studio! We are thrilled to have you on board.
    
    Get started by creating your first product catalog or inviting your team members: {dashboard_url}
    
    Best regards,
    The Catalog Studio Team
    """
    
    # Send the email
    if user.email:
        send_email(user.email, subject, message, html_message=html_message)
