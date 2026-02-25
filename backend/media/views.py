from rest_framework import viewsets, permissions, parsers
from .models import MediaItem
from .serializers import MediaItemSerializer

class MediaViewSet(viewsets.ModelViewSet):
    queryset = MediaItem.objects.none()
    serializer_class = MediaItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def get_queryset(self):
        return MediaItem.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
