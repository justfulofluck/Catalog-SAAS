from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MediaItemViewSet

router = DefaultRouter()
router.register(r'media', MediaItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
