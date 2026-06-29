import base64
import uuid
import re
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from catalogs.models import CatalogPage, Catalog


def _get_business_slug(user):
    if not user:
        return 'unknown'
    biz = (user.business_name or f'user_{user.id}').strip().lower()
    biz = re.sub(r'[^a-z0-9]+', '_', biz).strip('_')
    return biz or f'user_{user.id}'


def _convert_src(src, catalog):
    if not isinstance(src, str) or not src.startswith('data:image'):
        return src, False
    try:
        fmt_part, imgstr = src.split(';base64,')
        ext = fmt_part.split('/')[-1].split('?')[0]
        biz = _get_business_slug(catalog.owner)
        filename = f"{uuid.uuid4()}.{ext}"
        path = f'{biz}/catalogs/{catalog.uuid}/images/{filename}'
        saved = default_storage.save(path, ContentFile(base64.b64decode(imgstr)))
        rel = default_storage.url(saved)
        from django.conf import settings
        base_url = settings.BASE_URL
        new_src = f'{base_url}{rel}'
        return new_src, True
    except Exception as e:
        print(f"  ERROR: {e}")
        return src, False


class Command(BaseCommand):
    help = 'Migrate existing base64 image data in CatalogPage.layout_data to stored files'

    def handle(self, *args, **options):
        total_pages = CatalogPage.objects.count()
        total_converted = 0
        total_elements = 0

        self.stdout.write(f"Scanning {total_pages} catalog pages for base64 images...")

        for page in CatalogPage.objects.select_related('catalog__owner').iterator():
            layout = page.layout_data
            if not isinstance(layout, list):
                continue

            changed = False
            for el in layout:
                if isinstance(el, dict) and 'src' in el:
                    new_src, converted = _convert_src(el['src'], page.catalog)
                    if converted:
                        el['src'] = new_src
                        changed = True
                        total_converted += 1
                    total_elements += 1

            if changed:
                page.layout_data = layout
                page.save(update_fields=['layout_data'])
                self.stdout.write(f"  Updated page {page.id} (catalog: {page.catalog.name})")

        self.stdout.write(self.style.SUCCESS(
            f"\nDone! Scanned {total_elements} element src values across {total_pages} pages."
        ))
        self.stdout.write(self.style.SUCCESS(f"Converted {total_converted} base64 images to files."))
