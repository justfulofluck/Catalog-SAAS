from rest_framework import viewsets, permissions, parsers
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

class AdminAssetViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AdminAsset.objects.all()
    serializer_class = AdminAssetSerializer
    permission_classes = [permissions.IsAuthenticated]
