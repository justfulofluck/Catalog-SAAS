import datetime
from django.template.loader import render_to_string


def get_welcome_email_html(user_name, dashboard_url, support_email="support@catalogmakerr.com"):
    context = {
        "user_name": user_name,
        "dashboard_url": dashboard_url,
        "support_email": support_email,
        "year": datetime.datetime.now().year,
    }
    return render_to_string("emails/welcome_email.html", context)


def get_email_verification_html(user_name, otp):
    context = {
        "user_name": user_name,
        "otp": otp,
        "year": datetime.datetime.now().year,
    }
    return render_to_string("emails/email_verification_otp.html", context)


def get_password_reset_html(name, otp, time):
    context = {
        "user_name": name,
        "otp": otp,
        "time": time,
        "year": datetime.datetime.now().year,
    }
    return render_to_string("emails/password_reset_otp.html", context)


def get_subscription_purchase_html(name, plan_name, purchase_date, end_date, features, dashboard_url="/dashboard"):
    feature_items = ""
    if isinstance(features, dict):
        for k, v in features.items():
            val_str = "Unlimited" if v == -1 else ("Yes" if v is True else ("No" if v is False else str(v)))
            key_str = k.replace('_', ' ').title()
            feature_items += f'<div style="margin-bottom: 6px;"><strong style="color: #e2e8f0;">{key_str}:</strong> <span style="color: #38bdf8;">{val_str}</span></div>'

    end_date_str = end_date.strftime("%B %d, %Y") if hasattr(end_date, 'strftime') and end_date else "Lifetime"
    purchase_date_str = purchase_date.strftime("%B %d, %Y") if hasattr(purchase_date, 'strftime') and purchase_date else str(purchase_date)

    context = {
        "user_name": name,
        "plan_name": plan_name,
        "purchase_date": purchase_date_str,
        "end_date": end_date_str,
        "feature_items_html": feature_items,
        "dashboard_url": dashboard_url,
        "year": datetime.datetime.now().year,
    }
    return render_to_string("emails/subscription_confirmation.html", context)


def get_smtp_test_html(recipient, time_str):
    context = {
        "recipient": recipient,
        "time": time_str,
        "year": datetime.datetime.now().year,
    }
    return render_to_string("emails/smtp_test_email.html", context)
