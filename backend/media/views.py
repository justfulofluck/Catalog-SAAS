from rest_framework import viewsets, permissions, parsers
import os
from .models import MediaItem, AdminAsset
from .serializers import MediaItemSerializer, AdminAssetSerializer

class MediaViewSet(viewsets.ModelViewSet):
    queryset = MediaItem.objects.none()
    serializer_class = MediaItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def get_queryset(self):
        return MediaItem.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        file_path = None
        if instance.file:
            try:
                file_path = instance.file.path
            except Exception:
                file_path = None
        instance.delete()
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except OSError:
                pass

class AdminAssetViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AdminAsset.objects.all()
    serializer_class = AdminAssetSerializer
    permission_classes = [permissions.IsAuthenticated]
