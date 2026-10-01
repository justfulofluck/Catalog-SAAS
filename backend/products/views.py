from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.none()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(f"DEBUG: Category validation errors: {serializer.errors}")
        return super().create(request, *args, **kwargs)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.none()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['name', 'sku', 'description']
    ordering_fields = ['price', 'name', 'created_at']

    def get_queryset(self):
        return Product.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        # Enforce subscription product quota for regular users
        if not (request.user.is_staff or request.user.is_superuser):
            subscription = getattr(request.user, 'subscription', None)
            if subscription and subscription.plan and subscription.plan.features:
                max_products = subscription.plan.features.get('max_products')
                if max_products is not None and max_products > 0:
                    current_count = Product.objects.filter(user=request.user).count()
                    if current_count >= max_products:
                        return Response(
                            {
                                "error": f"You have reached the maximum product limit ({max_products}) for your {subscription.plan.name}. Please upgrade to add more products."
                            },
                            status=status.HTTP_403_FORBIDDEN
                        )
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(f"DEBUG: Product validation errors: {serializer.errors}")
        return super().create(request, *args, **kwargs)
