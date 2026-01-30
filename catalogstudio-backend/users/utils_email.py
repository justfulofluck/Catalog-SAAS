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
            print(f"DEBUG: Email credentials missing. User={user}, Pwd={'Set' if password else 'Not Set'}")
            return False

        print(f"DEBUG: Attempting to send email to {to_email} via {user}...")
        yag = yagmail.SMTP(user, password)
        yag.send(to=to_email, subject=subject, contents=contents)
        print("DEBUG: Email sent successfully.")
        return True
    except Exception as e:
        import traceback
        print(f"DEBUG: Error sending email: {e}")
        traceback.print_exc()
        return False
