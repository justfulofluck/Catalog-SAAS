import base64
import json
from django.core.files.base import ContentFile
from rest_framework import serializers
from .models import Category, Product

class CategorySerializer(serializers.ModelSerializer):
    parent_name = serializers.ReadOnlyField(source='parent.name')
    subcategories = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'uuid', 'user', 'name', 'description', 'rank', 'color', 'thumbnail', 'custom_schema', 'parent', 'parent_name', 'subcategories', 'created_at']
        read_only_fields = ['id', 'user', 'uuid', 'created_at']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if instance.thumbnail and getattr(instance.thumbnail, 'name', '').startswith(('http://', 'https://')):
            ret['thumbnail'] = instance.thumbnail.name
        return ret

    def get_subcategories(self, obj):
        if obj.parent:  # Only show subcategories for top-level categories
            return []
        return list(obj.subcategories.values_list('id', flat=True))

    def validate_parent(self, value):
        if value and value.parent:
            raise serializers.ValidationError("Cannot create sub-subcategory. Only one level of subcategory is allowed.")
        return value

    def to_internal_value(self, data):
        # Copy data to avoid mutating original if needed
        data = data.copy() if hasattr(data, 'copy') else data

        # Handle empty strings/nulls for optional fields
        for field in ['thumbnail', 'parent', 'description', 'color']:
            if field in data and (data[field] == '' or data[field] is None):
                data[field] = None

        # Handle base64 thumbnail
        thumbnail = data.get('thumbnail')
        if isinstance(thumbnail, str) and thumbnail.startswith('data:image'):
            try:
                format, imgstr = thumbnail.split(';base64,')
                ext = format.split('/')[-1]
                import uuid
                filename = f"cat_{uuid.uuid4()}.{ext}"
                data['thumbnail'] = ContentFile(base64.b64decode(imgstr), name=filename)
            except Exception as e:
                print(f"DEBUG: CategorySerializer - Error decoding base64 thumbnail: {e}")
        elif isinstance(thumbnail, str) and thumbnail.startswith(('http', '/media')):
            # If it's already a URL, we don't want DRF to try and validate it as a file upload during creation
            # Remove it so the model keeps its default or existing value
            data.pop('thumbnail')

        return super().to_internal_value(data)


class ProductSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)

    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ['user', 'uuid', 'created_at', 'updated_at']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if instance.image and getattr(instance.image, 'name', '').startswith(('http://', 'https://')):
            ret['image'] = instance.image.name
        return ret

    def _process_custom_fields(self, custom_fields):
        """
        Scans custom_fields for base64 encoded images.
        Saves them to the server and replaces base64 with the media URL.
        """
        if not custom_fields or not isinstance(custom_fields, dict):
            return custom_fields

        processed_fields = custom_fields.copy()
        for field_id, value in processed_fields.items():
            if isinstance(value, str) and value.startswith("data:image"):
                try:
                    # Extract format and data
                    format, imgstr = value.split(';base64,')
                    ext = format.split('/')[-1]
                    
                    # Generate a filename
                    import uuid
                    filename = f"{uuid.uuid4()}.{ext}"
                    
                    # Create a ContentFile
                    data = ContentFile(base64.b64decode(imgstr), name=filename)
                    
                    # We need a Product instance or some context to use the model's upload_to
                    # For simplicity here, we can save to a dedicated custom fields media folder
                    from django.core.files.storage import default_storage
                    import os
                    
                    # Try to get user from context
                    request = self.context.get("request")
                    user_id = "admin"
                    if request and request.user and not request.user.is_anonymous:
                        user_id = str(request.user.id)
                        
                    path = f"user_media/{user_id}/products/custom/{filename}"
                    actual_path = default_storage.save(path, data)
                    processed_fields[field_id] = default_storage.url(actual_path)
                except Exception as e:
                    print(f"Error processing base64 image in field {field_id}: {e}")
                    
        return processed_fields

    def to_internal_value(self, data):
        # Copy data to avoid mutating original if needed
        data = data.copy() if hasattr(data, 'copy') else data

        # Handle empty strings/nulls for optional fields
        for field in ['image', 'category', 'description']:
            if field in data and (data[field] == '' or data[field] is None):
                data[field] = None
                
        # Handle sku specifically to avoid null constraint violations
        if 'sku' in data and data['sku'] is None:
            data['sku'] = ""

        external_image_url = None

        # Handle base64 image
        image = data.get('image')
        if isinstance(image, str) and image.startswith('data:image'):
            try:
                format, imgstr = image.split(';base64,')
                ext = format.split('/')[-1]
                import uuid
                filename = f"prod_{uuid.uuid4()}.{ext}"
                data['image'] = ContentFile(base64.b64decode(imgstr), name=filename)
            except Exception as e:
                print(f"DEBUG: ProductSerializer - Error decoding base64 image: {e}")
        elif isinstance(image, str) and image.startswith(('http', '/media')):
            # Avoid validating existing URLs as file uploads
            external_image_url = data.pop('image')

        # Handle custom_fields - process any base64 images inside
        custom_fields = data.get("custom_fields")
        if custom_fields:
            if isinstance(custom_fields, str):
                try:
                    import json
                    custom_fields = json.loads(custom_fields)
                except:
                    pass
            processed_fields = self._process_custom_fields(custom_fields)
            data["custom_fields"] = processed_fields
            
            # Promotion logic: If the primary image field is empty, try to fill it from custom fields
            if not data.get("image") and not external_image_url:
                # Look for the first field that contains a media URL
                for field_val in processed_fields.values():
                    if isinstance(field_val, str) and field_val.startswith(("/media/", "http")):
                        # We found an image URL in custom fields!
                        # Promote it to the main image field
                        external_image_url = field_val
                        break

        ret = super().to_internal_value(data)
        if external_image_url:
            ret['image'] = external_image_url

        return ret
