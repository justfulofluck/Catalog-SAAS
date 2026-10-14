import logging

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.conf import settings

from users.models import UserSubscription, SystemSetting
from utils.email_service import send_email
from utils.email_templates import get_subscription_expiring_html

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = (
        "Send a one-time reminder email to users whose subscription/trial "
        "expires within the next N days (default 1)."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--days",
            type=int,
            default=1,
            help="Remind users whose plan expires within this many days (default: 1).",
        )
        parser.add_argument("--dry-run", action="store_true")

    def handle(self, *args, **options):
        days = options["days"]
        dry_run = options["dry_run"]
        now = timezone.now()
        threshold = now + timezone.timedelta(days=days)

        soon = UserSubscription.objects.select_related("user", "plan").filter(
            is_active=True,
            end_date__isnull=False,
            end_date__gt=now,
            end_date__lte=threshold,
            expiring_notified_at__isnull=True,
        )

        count = soon.count()
        if count == 0:
            self.stdout.write("No upcoming expirations to notify.")
            return

        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000").rstrip("/")
        upgrade_url = f"{frontend_url}/pricing"

        support_email = "support@catalogmakerr.com"
        try:
            support_email = SystemSetting.get_settings().support_email or support_email
        except Exception:
            pass

        sent_count = 0
        for sub in soon:
            user = sub.user
            plan_name = sub.plan.name if sub.plan else "Plan"
            days_left = max(1, sub.days_remaining or 1)
            self.stdout.write(f"Reminder: {user.email} | {plan_name} | {days_left} day(s) left")

            if dry_run:
                continue

            try:
                html = get_subscription_expiring_html(
                    name=user.name or user.email,
                    plan_name=plan_name,
                    end_date=sub.end_date,
                    days_left=days_left,
                    upgrade_url=upgrade_url,
                    support_email=support_email,
                )
                if send_email(
                    user.email,
                    f"Your catalogmakerr {plan_name} ends in {days_left} day(s)",
                    f"Your plan expires soon. Upgrade to keep full access: {upgrade_url}",
                    html_message=html,
                ):
                    sub.expiring_notified_at = now
                    sub.save(update_fields=["expiring_notified_at"])
                    sent_count += 1
            except Exception:
                logger.exception("Failed to send expiring reminder to %s", user.email)

        if dry_run:
            self.stdout.write(self.style.WARNING(f"[dry-run] {count} reminder(s) would be sent."))
            return

        self.stdout.write(self.style.SUCCESS(f"Sent {sent_count} expiry reminder email(s)."))
