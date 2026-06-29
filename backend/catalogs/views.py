import base64
import uuid as uuid_lib
import re
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Catalog, CatalogPage, Theme
from .serializers import CatalogSerializer, CatalogCreateSerializer, CatalogPageSerializer, ThemeSerializer

class ThemeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Theme.objects.all()
    serializer_class = ThemeSerializer
    permission_classes = [permissions.AllowAny]

class CatalogViewSet(viewsets.ModelViewSet):
    queryset = Catalog.objects.none()
    serializer_class = CatalogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Catalog.objects.filter(owner=self.request.user)

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
            catalog = Catalog.objects.get(uuid=uuid, status='published')
            serializer = CatalogSerializer(catalog)
            return Response(serializer.data)
        except Catalog.DoesNotExist:
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
        catalog = self.get_object()
        page_data = request.data
        page_number = page_data.get('pageNumber')
        elements = page_data.get('elements', [])

        # Convert any base64 src URLs to stored files
        for el in elements:
            if isinstance(el, dict):
                src = el.get('src', '')
                el['src'] = self._save_base64_src(src, catalog)

        page, created = CatalogPage.objects.update_or_create(
            catalog=catalog,
            page_number=page_number,
            defaults={
                'type': page_data.get('type', 'interior'),
                'layout_data': elements,
                'category_id': page_data.get('categoryId')
            }
        )
        return Response({'status': 'saved', 'page_id': page.id})
