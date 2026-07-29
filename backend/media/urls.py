from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MediaViewSet, AdminAssetViewSet

router = DefaultRouter()
router.register(r'media', MediaViewSet)
router.register(r'admin-assets', AdminAssetViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
