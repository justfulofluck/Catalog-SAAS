
def get_password_reset_html(name, otp, time):
    return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Password Reset OTP</title>
</head>
<body style="margin:0; padding:0; background-color:#f9fafb; font-family:Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f9fafb; padding:40px 0;">
    <tr>
        <td align="center">

            <!-- Main Container -->
            <table width="500" cellpadding="0" cellspacing="0" border="0"
                style="background-color:#ffffff; border-radius:12px; border:1px solid #f3f4f6; padding:40px;">

                <!-- Title -->
                <tr>
                    <td align="center" style="padding-bottom:25px;">
                        <h1 style="margin:0; color:#111827; font-size:24px; font-weight:800;">
                            Password Reset OTP
                        </h1>
                    </td>
                </tr>

                <!-- Greeting -->
                <tr>
                    <td style="font-size:15px; color:#4b5563; padding-bottom:15px;">
                        Hello <strong style="color:#111827;">{name}</strong>,
                    </td>
                </tr>

                <!-- Message -->
                <tr>
                    <td style="font-size:15px; color:#4b5563; padding-bottom:20px;">
                        You requested to reset your password. Use the OTP below to continue:
                    </td>
                </tr>

                <!-- OTP Box -->
                <tr>
                    <td align="center" style="padding:20px 0;">
                        <div style="
                            background-color:#6366f1;
                            color:#ffffff;
                            font-size:30px;
                            font-weight:700;
                            letter-spacing:6px;
                            padding:18px 0;
                            border-radius:8px;
                            display:inline-block;
                            width:100%;
                            max-width:350px;">
                            {otp}
                        </div>
                    </td>
                </tr>

                <!-- Expiry -->
                <tr>
                    <td style="font-size:14px; color:#4b5563; padding-top:10px;">
                        This code will expire in <strong style="color:#111827;">5 minutes</strong>.
                    </td>
                </tr>

                <!-- Time -->
                <tr>
                    <td style="font-size:13px; color:#6b7280; padding-bottom:25px;">
                        Time: {time}
                    </td>
                </tr>

                <!-- Security Note -->
                <tr>
                    <td style="font-size:13px; color:#9ca3af; padding-bottom:25px;">
                        If you did not request a password reset, please ignore this email.
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td align="center" style="border-top:1px solid #f3f4f6; padding-top:20px; font-size:12px; color:#9ca3af;">
                        &copy; 2026 Catalog Studio. All rights reserved.
                    </td>
                </tr>

            </table>
            <!-- End Container -->

        </td>
    </tr>
</table>

</body>
</html>
"""

def get_subscription_purchase_html(name, plan_name, purchase_date, end_date, features):
    feature_items = ""
    if isinstance(features, dict):
        for k, v in features.items():
            val_str = "Unlimited" if v == -1 else ("Yes" if v is True else ("No" if v is False else str(v)))
            key_str = k.replace('_', ' ').title()
            feature_items += f'<li style="margin-bottom: 8px;"><strong>{key_str}:</strong> {val_str}</li>'

    end_date_str = end_date.strftime("%B %d, %Y") if end_date else "Lifetime"
    purchase_date_str = purchase_date.strftime("%B %d, %Y")

    return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Subscription Confirmation</title>
</head>
<body style="margin:0; padding:0; background-color:#f9fafb; font-family:Segoe UI, Tahoma, Geneva, Verdana, sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f9fafb; padding:40px 0;">
    <tr>
        <td align="center">

            <!-- Main Container -->
            <table width="500" cellpadding="0" cellspacing="0" border="0"
                style="background-color:#ffffff; border-radius:12px; border:1px solid #f3f4f6; padding:40px;">

                <!-- Title -->
                <tr>
                    <td align="center" style="padding-bottom:25px;">
                        <h1 style="margin:0; color:#111827; font-size:24px; font-weight:800;">
                            Thank You for Your Purchase!
                        </h1>
                    </td>
                </tr>

                <!-- Greeting -->
                <tr>
                    <td style="font-size:15px; color:#4b5563; padding-bottom:15px;">
                        Hello <strong style="color:#111827;">{name}</strong>,
                    </td>
                </tr>

                <!-- Message -->
                <tr>
                    <td style="font-size:15px; color:#4b5563; padding-bottom:20px;">
                        We are thrilled to let you know that your subscription to the <strong>{plan_name}</strong> has been successfully activated. Look at what you've got!
                    </td>
                </tr>

                <!-- Details -->
                <tr>
                    <td style="font-size:14px; color:#4b5563; padding-bottom:15px;">
                        <strong>Purchase Date:</strong> {purchase_date_str}<br/>
                        <strong>Subscription End Date:</strong> {end_date_str}
                    </td>
                </tr>

                <!-- Features -->
                <tr>
                    <td style="background-color:#f3f4f6; border-radius:8px; padding:20px; font-size:14px; color:#374151;">
                        <h3 style="margin-top:0; margin-bottom:10px; font-size:16px; color:#111827;">Your Plan Features:</h3>
                        <ul style="margin:0; padding-left:20px;">
                            {feature_items}
                        </ul>
                    </td>
                </tr>

                <!-- Footer -->
                <tr>
                    <td align="center" style="border-top:1px solid #e5e7eb; padding-top:20px; margin-top:30px; font-size:12px; color:#9ca3af;">
                        &copy; 2026 Catalog Studio. All rights reserved.
                    </td>
                </tr>

            </table>
            <!-- End Container -->

        </td>
    </tr>
</table>

</body>
</html>
"""
