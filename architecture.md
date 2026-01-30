# Catalog SAAS - Backend Architecture

## Overview
A robust backend for the Catalog SAAS application using Django and MySQL, exposing a RESTful API for the React frontend.

## Tech Stack

### Core Framework
- **Framework**: Django 5.x
- **API**: Django Rest Framework (DRF)
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens) or Session-based
- **CORS**: django-cors-headers
- **Image Handling**: Pillow

### Dependencies
```
django
djangorestframework
mysqlclient (or pymysql)
django-cors-headers
python-dotenv
Pillow
```

## Architecture

### Project Structure
```
catalogstudio-backend/
├── catalog_project/          # Core Django project
│   ├── settings/            # Django settings
│   ├── urls.py             # Root URL configuration
│   └── wsgi.py             # WSGI configuration
├── core/                   # Base utilities and shared functionality
├── users/                  # User management and authentication
├── inventory/              # Products, Categories, and Media
├── publications/           # Catalogs, Pages, Templates, and Themes
└── requirements.txt        # Project dependencies
```

### Django Apps

#### 1. Core App
- Base project settings and utilities
- Shared models and mixins
- Common functionality across apps

#### 2. Users App
- Custom User model
- Authentication views
- User management endpoints

#### 3. Inventory App
- Product management
- Category organization
- Media file handling

#### 4. Publications App
- Catalog creation and management
- Page templates and themes
- Publication workflow

## Database Schema

### Users App Models

#### User
```python
class User(AbstractUser):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    avatar = models.URLField(null=True, blank=True)  # or ImageField
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
```

### Inventory App Models

#### Category
```python
class Category(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    rank = models.IntegerField(default=0)
    color = models.CharField(max_length=7, default='#000000')  # hex color
    thumbnail = models.ImageField(upload_to='category_thumbnails/', null=True, blank=True)
```

#### Product
```python
class Product(models.Model):
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=100, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='product_images/')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
```

#### MediaItem
```python
class MediaItem(models.Model):
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=50)  # image, video, document
    file = models.FileField(upload_to='media/')
    thumbnail = models.ImageField(upload_to='media_thumbnails/', null=True, blank=True)
    dimensions = models.JSONField(null=True, blank=True)  # width, height, size
```

### Publications App Models

#### Theme
```python
class Theme(models.Model):
    name = models.CharField(max_length=200)
    background_color = models.CharField(max_length=7, default='#ffffff')
    heading_color = models.CharField(max_length=7, default='#000000')
    text_color = models.CharField(max_length=7, default='#333333')
    accent_color = models.CharField(max_length=7, default='#007bff')
    font_family = models.CharField(max_length=100, default='Arial')
    # Additional theme properties
```

#### Catalog
```python
class Catalog(models.Model):
    name = models.CharField(max_length=200)
    products = models.ManyToManyField(Product, related_name='catalogs')
    theme = models.ForeignKey(Theme, on_delete=models.SET_NULL, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### CatalogPage
```python
class CatalogPage(models.Model):
    catalog = models.ForeignKey(Catalog, on_delete=models.CASCADE, related_name='pages')
    page_number = models.IntegerField()
    elements = models.JSONField(default=dict)  # Canvas elements structure
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['catalog', 'page_number']
        ordering = ['page_number']
```

## API Endpoints

### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/register/` - User registration
- `GET /api/auth/me/` - Get current user info
- `PUT /api/auth/me/` - Update current user

### Products
- `GET /api/products/` - List all products
- `POST /api/products/` - Create new product
- `GET /api/products/{id}/` - Get product details
- `PUT /api/products/{id}/` - Update product
- `DELETE /api/products/{id}/` - Delete product

### Categories
- `GET /api/categories/` - List all categories
- `POST /api/categories/` - Create new category
- `GET /api/categories/{id}/` - Get category details
- `PUT /api/categories/{id}/` - Update category
- `DELETE /api/categories/{id}/` - Delete category

### Catalogs
- `GET /api/catalogs/` - List all catalogs
- `POST /api/catalogs/` - Create new catalog
- `GET /api/catalogs/{id}/` - Get catalog details
- `PUT /api/catalogs/{id}/` - Update catalog
- `DELETE /api/catalogs/{id}/` - Delete catalog
- `GET /api/catalogs/{id}/pages/` - Get catalog pages
- `POST /api/catalogs/{id}/pages/` - Add page to catalog

### Media
- `GET /api/media/` - List all media items
- `POST /api/media/` - Upload new media
- `GET /api/media/{id}/` - Get media details
- `DELETE /api/media/{id}/` - Delete media

### Themes
- `GET /api/themes/` - List all themes
- `POST /api/themes/` - Create new theme
- `GET /api/themes/{id}/` - Get theme details
- `PUT /api/themes/{id}/` - Update theme
- `DELETE /api/themes/{id}/` - Delete theme

## Data Flow

### Canvas Elements Storage
The complex canvas elements from the frontend (defined in `types.ts`) are stored as JSON in the `CatalogPage.elements` field to preserve the structure and allow for flexible page layouts.

### Media Handling
- Images and files are uploaded to Django's media storage
- Thumbnails are automatically generated for images
- Media items are tracked with metadata (dimensions, size, type)

### Authentication Flow
- JWT tokens for stateless authentication
- Session-based authentication as fallback
- CORS configured for frontend communication

## Development Setup

### Environment Configuration
```python
# .env file
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=mysql://user:password@localhost:3306/catalog_db
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### Database Setup
1. Create MySQL database: `catalog_db`
2. Run migrations: `python manage.py makemigrations && python manage.py migrate`
3. Create superuser: `python manage.py createsuperuser`

### Development Server
```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
python manage.py runserver
```

## Testing Strategy

### Unit Tests
- Model tests for all custom models
- View tests for API endpoints
- Serializer tests for data validation

### Integration Tests
- API endpoint testing with test client
- Database operations testing
- File upload testing

### API Testing
- Use Django REST framework's test client
- Test authentication and authorization
- Verify CORS headers

## Security Considerations

### Authentication
- JWT token expiration and refresh
- Password hashing with Django's built-in security
- Role-based access control

### Data Validation
- Input sanitization through DRF serializers
- File upload restrictions
- SQL injection prevention through Django ORM

### CORS Configuration
- Restrict allowed origins in production
- Configure appropriate headers
- Handle preflight requests

## Deployment Considerations

### Production Settings
- Debug mode disabled
- Secure secret key management
- Database connection pooling
- Static file serving configuration

### Scaling
- Database indexing for frequently queried fields
- Caching strategy for API responses
- Media storage optimization (CDN integration)

## Future Enhancements

### API Features
- Pagination for large datasets
- Filtering and sorting capabilities
- Bulk operations for efficiency
- API versioning strategy

### Performance
- Database query optimization
- Caching implementation
- Async task processing for media handling
- API rate limiting

### Monitoring
- API logging and monitoring
- Performance metrics collection
- Error tracking and alerting