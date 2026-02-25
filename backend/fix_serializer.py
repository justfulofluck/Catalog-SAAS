import sys

with open("products/serializers.py", "r") as f:
    content = f.read()

# Replace the to_internal_value in ProductSerializer
old_func = """    def to_internal_value(self, data):
        # Copy data to avoid mutating original if needed
        data = data.copy() if hasattr(data, 'copy') else data

        # Handle empty strings/nulls for optional fields
        for field in ['image', 'category', 'description', 'sku']:
            if field in data and (data[field] == '' or data[field] is None):
                data[field] = None

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
            data.pop('image')

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
            if not data.get("image"):
                # Look for the first field that contains a media URL
                for field_val in processed_fields.values():
                    if isinstance(field_val, str) and field_val.startswith(("/media/", "http")):
                        # We found an image URL in custom fields!
                        # Promote it to the main image field
                        data["image"] = field_val
                        break

        return super().to_internal_value(data)"""

new_func = """    def to_internal_value(self, data):
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

        return ret"""

if old_func in content:
    content = content.replace(old_func, new_func)
    with open("products/serializers.py", "w") as f:
        f.write(content)
    print("SUCCESS")
else:
    print("FAILED")
