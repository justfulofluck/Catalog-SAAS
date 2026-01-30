import yagmail
import os
from django.conf import settings

def send_notification(to_email, subject, contents):
    """
    Sends an email using yagmail.
    """
    try:
        user = os.getenv('GMAIL_USER')
        password = os.getenv('GMAIL_PASSWORD')
        
        if not user or not password:
            print("Error: GMAIL_USER or GMAIL_PASSWORD not set in .env")
            return False

        yag = yagmail.SMTP(user, password)
        yag.send(to=to_email, subject=subject, contents=contents)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
