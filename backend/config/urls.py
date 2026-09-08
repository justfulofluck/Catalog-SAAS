"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from users.views import PublicRegisterView, CustomLoginView
from dj_rest_auth.views import UserDetailsView
from dj_rest_auth.jwt_auth import get_refresh_view
from rest_framework import permissions

RefreshView = get_refresh_view()


class CustomRefreshView(RefreshView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []


urlpatterns = [
    path("admin/", admin.site.urls),
    # Explicit public auth endpoints with empty authentication_classes
    # so expired or invalid Authorization headers do not block login or refresh
    path("api/auth/login/", CustomLoginView.as_view(), name="rest_login"),
    path("api/auth/token/refresh/", CustomRefreshView.as_view(), name="token_refresh"),
    path("api/token/refresh/", CustomRefreshView.as_view(), name="token_refresh_alt"),
    path("api/auth/registration/", PublicRegisterView.as_view(), name="rest_register"),
    path("api/auth/", include("dj_rest_auth.urls")),
    path("api/", include("users.urls")),
    path("api/", include("products.urls")),
    path("api/", include("media.urls")),
    path("api/", include("catalogs.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
