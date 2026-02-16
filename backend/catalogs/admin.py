from django.contrib import admin
from .models import Catalog, CatalogPage, Theme

@admin.register(Theme)
class ThemeAdmin(admin.ModelAdmin):
    list_display = ('name',)

class CatalogPageInline(admin.TabularInline):
    model = CatalogPage
    extra = 0

@admin.register(Catalog)
class CatalogAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'status', 'updated_at')
    list_filter = ('status', 'owner')
    search_fields = ('name',)
    inlines = [CatalogPageInline]
