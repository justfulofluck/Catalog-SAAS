from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CatalogViewSet, ThemeViewSet

router = DefaultRouter()
router.register(r'catalogs', CatalogViewSet, basename='catalog')
router.register(r'themes', ThemeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
