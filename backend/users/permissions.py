from rest_framework import permissions, status
from rest_framework.exceptions import APIException

SUBSCRIPTION_EXPIRED_CODE = "subscription_expired"
SUBSCRIPTION_EXPIRED_MESSAGE = (
    "Your subscription or free trial has expired. Please upgrade to continue."
)


class SubscriptionExpired(APIException):
    status_code = status.HTTP_403_FORBIDDEN
    default_code = SUBSCRIPTION_EXPIRED_CODE
    default_detail = SUBSCRIPTION_EXPIRED_MESSAGE

    def __init__(self):
        super().__init__(
            {
                "error": SUBSCRIPTION_EXPIRED_MESSAGE,
                "code": SUBSCRIPTION_EXPIRED_CODE,
                "upgrade_required": True,
            }
        )


def is_subscription_active(user):
    """Return True when the user is allowed to perform write/interactive actions.

    Staff/superusers and users without a subscription record are always allowed.
    """
    if not user or not getattr(user, "is_authenticated", False):
        return False
    if getattr(user, "is_staff", False) or getattr(user, "is_superuser", False):
        return True
    sub = getattr(user, "subscription", None)
    if sub is None:
        return True
    return bool(sub.is_currently_active)


class IsSubscriptionActiveForWrite(permissions.BasePermission):
    """Allow safe (read) methods for anyone authenticated, but block write
    methods when the user's subscription/trial has expired or is suspended."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        user = getattr(request, "user", None)
        # Authentication is enforced by other permission classes; don't pre-empt it.
        if user is None or not getattr(user, "is_authenticated", False):
            return True

        if getattr(user, "is_staff", False) or getattr(user, "is_superuser", False):
            return True

        sub = getattr(user, "subscription", None)
        if sub is None or sub.is_currently_active:
            return True

        raise SubscriptionExpired()
