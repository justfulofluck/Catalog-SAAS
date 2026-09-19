import base64
import uuid as uuid_lib
import re
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Catalog, CatalogPage, Theme, SystemTemplate
from .serializers import CatalogSerializer, CatalogCreateSerializer, CatalogPageSerializer, ThemeSerializer, SystemTemplateSerializer

class SystemTemplateViewSet(viewsets.ModelViewSet):
    queryset = SystemTemplate.objects.all()
    serializer_class = SystemTemplateSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

class ThemeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Theme.objects.all()
    serializer_class = ThemeSerializer
    permission_classes = [permissions.AllowAny]

class CatalogViewSet(viewsets.ModelViewSet):
    queryset = Catalog.objects.none()
    serializer_class = CatalogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff or self.request.user.is_superuser:
            return Catalog.objects.all().order_by('-updated_at')
        return Catalog.objects.filter(owner=self.request.user).order_by('-updated_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return CatalogCreateSerializer
        return CatalogSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        catalog = self.get_object()
        catalog.status = 'published'
        catalog.save()
        return Response({'status': 'published', 'uuid': catalog.uuid})

    @action(detail=False, methods=['get'], url_path='public/(?P<uuid>[^/.]+)', permission_classes=[permissions.AllowAny])
    def public(self, request, uuid=None):
        try:
            from django.db.models import Q
            try:
                catalog = Catalog.objects.get(Q(uuid=uuid) | Q(id=int(uuid)), status='published')
            except ValueError:
                catalog = Catalog.objects.get(uuid=uuid, status='published')
            serializer = CatalogSerializer(catalog)
            return Response(serializer.data)
        except Exception:
            return Response({'error': 'Catalog not found or not published'}, status=status.HTTP_404_NOT_FOUND)

    def _save_base64_src(self, src, catalog):
        """Decode a data:image URL, save to disk, return absolute URL."""
        if not isinstance(src, str) or not src.startswith('data:image'):
            return src
        try:
            fmt_part, imgstr = src.split(';base64,')
            ext = fmt_part.split('/')[-1].split('?')[0]
            biz = self._get_business_slug(catalog.owner)
            filename = f"{uuid_lib.uuid4()}.{ext}"
            path = f'{biz}/catalogs/{catalog.uuid}/images/{filename}'
            saved = default_storage.save(path, ContentFile(base64.b64decode(imgstr)))
            rel = default_storage.url(saved)
            return self.request.build_absolute_uri(rel)
        except Exception as e:
            print(f"Error converting base64 image in catalog {catalog.id}: {e}")
            return src

    def _get_business_slug(self, user):
        if not user:
            return 'unknown'
        biz = (user.business_name or f'user_{user.id}').strip().lower()
        biz = re.sub(r'[^a-z0-9]+', '_', biz).strip('_')
        return biz or f'user_{user.id}'

    @action(detail=True, methods=['post'])
    def save_page(self, request, pk=None):
        import time
        from django.db import transaction, OperationalError
        from products.models import Category

        catalog = self.get_object()
        page_data = request.data
        page_number = page_data.get('pageNumber')
        if page_number is None:
            page_number = page_data.get('page_number')
        if page_number is None:
            page_number = catalog.pages.count() + 1
        else:
            try:
                page_number = int(page_number)
            except (ValueError, TypeError):
                page_number = catalog.pages.count() + 1

        elements = page_data.get('elements', [])

        # Convert any base64 src URLs to stored files
        for el in elements:
            if isinstance(el, dict):
                src = el.get('src', '')
                el['src'] = self._save_base64_src(src, catalog)

        category_id = page_data.get('categoryId')
        valid_cat_id = None
        if category_id:
            try:
                cat_int = int(category_id)
                if Category.objects.filter(id=cat_int).exists():
                    valid_cat_id = cat_int
            except Exception:
                valid_cat_id = None

        page_type = str(page_data.get('type', 'interior'))[:20]

        # Retry up to 3 times in case SQLite is briefly locked
        for attempt in range(3):
            try:
                with transaction.atomic():
                    page, created = CatalogPage.objects.update_or_create(
                        catalog=catalog,
                        page_number=page_number,
                        defaults={
                            'type': page_type,
                            'layout_data': elements,
                            'category_id': valid_cat_id
                        }
                    )
                return Response({'status': 'saved', 'page_id': page.id})
            except OperationalError:
                if attempt == 2:
                    raise
                time.sleep(0.1 * (attempt + 1))
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def save_all_pages(self, request, pk=None):
        from django.db import transaction
        from products.models import Category

        catalog = self.get_object()
        pages_data = request.data.get('pages', [])
        
        saved_count = 0
        with transaction.atomic():
            for idx, page_data in enumerate(pages_data):
                page_number = page_data.get('pageNumber') or page_data.get('page_number') or (idx + 1)
                try:
                    page_number = int(page_number)
                except (ValueError, TypeError):
                    page_number = idx + 1

                elements = page_data.get('elements', [])
                for el in elements:
                    if isinstance(el, dict):
                        src = el.get('src', '')
                        el['src'] = self._save_base64_src(src, catalog)

                category_id = page_data.get('categoryId')
                valid_cat_id = None
                if category_id:
                    try:
                        cat_int = int(category_id)
                        if Category.objects.filter(id=cat_int).exists():
                            valid_cat_id = cat_int
                    except Exception:
                        valid_cat_id = None

                page_type = str(page_data.get('type', 'interior'))[:20]

                CatalogPage.objects.update_or_create(
                    catalog=catalog,
                    page_number=page_number,
                    defaults={
                        'type': page_type,
                        'layout_data': elements,
                        'category_id': valid_cat_id
                    }
                )
                saved_count += 1

        return Response({'status': 'saved', 'saved_count': saved_count})
