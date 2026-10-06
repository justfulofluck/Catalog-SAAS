import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = "Seeds default administrator / superuser accounts"

    def handle(self, *args, **options):
        User = get_user_model()

        admins = [
            {
                "email": "admin@catalogstudio.com",
                "username": "admin_catalogstudio",
                "name": "Super Admin",
                "password": "admin123",
            },
            {
                "email": "admin@catalogmakerr.com",
                "username": "admin",
                "name": "Super Admin",
                "password": "admin123",
            },
            {
                "email": "catalogmakerr@gmail.com",
                "username": "catalogmakerr",
                "name": "Catalog Maker Admin",
                "password": "69VUHqmuvjoq2L",
            },
        ]

        for acc in admins:
            user, created = User.objects.get_or_create(
                email=acc["email"],
                defaults={
                    "username": acc["username"],
                    "name": acc["name"],
                    "is_staff": True,
                    "is_superuser": True,
                    "is_active": True,
                    "is_verified": True,
                },
            )
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            user.is_verified = True
            user.set_password(acc["password"])
            user.save()

            action = "Created" if created else "Updated"
            self.stdout.write(self.style.SUCCESS(f"{action} admin: {acc['email']}"))
