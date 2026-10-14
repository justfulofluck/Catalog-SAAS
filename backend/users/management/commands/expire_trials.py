import logging

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.conf import settings

from users.models import UserSubscription, SystemSetting
from utils.email_service import send_email
from utils.email_templates import get_subscription_expired_html

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = (
        "Expire subscriptions/trials whose end_date has passed: marks them "
        "inactive and sends a one-time expiry email to the user and an alert "
        "to the platform support address."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="List subscriptions that would expire without making changes.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        now = timezone.now()

        expired = UserSubscription.objects.select_related("user", "plan").filter(
            is_active=True,
            end_date__isnull=False,
            end_date__lt=now,
        )

        count = expired.count()
        if count == 0:
            self.stdout.write("No subscriptions to expire.")
            return

        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000").rstrip("/")
        upgrade_url = f"{frontend_url}/pricing"

        support_email = "support@catalogmakerr.com"
        try:
            support_email = SystemSetting.get_settings().support_email or support_email
        except Exception:
            pass

        notified = []
        for sub in expired:
            user = sub.user
            plan_name = sub.plan.name if sub.plan else "Plan"
            self.stdout.write(
                f"Expiring: {user.email} | {plan_name} | end={sub.end_date}"
            )

            if dry_run:
                continue

            sub.is_active = False
            sub.expired_notified_at = now
            sub.save(update_fields=["is_active", "expired_notified_at"])

            try:
                html = get_subscription_expired_html(
                    name=user.name or user.email,
                    plan_name=plan_name,
                    end_date=sub.end_date,
                    upgrade_url=upgrade_url,
                    support_email=support_email,
                )
                sent = send_email(
                    user.email,
                    "Your catalogmakerr trial has ended",
                    "Your free trial has ended. Your workspace is now read-only. "
                    "Upgrade to restore full access.",
                    html_message=html,
                )
                if sent:
                    notified.append(user.email)
            except Exception:
                logger.exception("Failed to send expiry email to %s", user.email)

        if dry_run:
            self.stdout.write(self.style.WARNING(f"[dry-run] {count} subscription(s) would expire."))
            return

        self.stdout.write(self.style.SUCCESS(f"Expired {count} subscription(s); notified {len(notified)} user(s)."))

        # Admin / platform alert (single digest email)
        if notified:
            try:
                send_email(
                    support_email,
                    f"[catalogmakerr] {len(notified)} subscription(s) just expired",
                    "The following accounts moved to read-only after trial expiry:\n\n"
                    + "\n".join(notified),
                )
            except Exception:
                logger.exception("Failed to send admin expiry digest")
