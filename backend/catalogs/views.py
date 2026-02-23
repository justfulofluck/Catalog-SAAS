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
    serializer_class = CatalogSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Catalog.objects.all()

    def get_serializer_class(self):
        if self.action == 'create':
            return CatalogCreateSerializer
        return CatalogSerializer

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(owner=user)

    @action(detail=True, methods=['post'])
    def save_page(self, request, pk=None):
        catalog = self.get_object()
        page_data = request.data
        page_number = page_data.get('pageNumber')
        
        # Simple update or create logic for a page
        page, created = CatalogPage.objects.update_or_create(
            catalog=catalog,
            page_number=page_number,
            defaults={
                'type': page_data.get('type', 'interior'),
                'layout_data': page_data.get('elements', []),
                'category_id': page_data.get('categoryId')
            }
        )
        return Response({'status': 'saved', 'page_id': page.id})
