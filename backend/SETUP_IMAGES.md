"""
Database model updates for image support
Run: python manage.py makemigrations
Run: python manage.py migrate
"""

# Add to your Crop model:
"""
class Crop(models.Model):
    # ... existing fields ...
    
    # Add this field for image support
    image_url = models.ImageField(
        upload_to='crops/%Y/%m/%d/',
        null=True,
        blank=True,
        help_text='Crop image'
    )
    image_alt_text = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text='Alternative text for image accessibility'
    )
    
    # Add this method to get full image URL
    def get_image_url(self):
        if self.image_url:
            return self.image_url.url
        return None
    
    class Meta:
        db_table = 'crops'
        ordering = ['name']
"""

# Add to your Livestock model:
"""
class Livestock(models.Model):
    # ... existing fields ...
    
    # Add this field for image support
    image_url = models.ImageField(
        upload_to='livestock/%Y/%m/%d/',
        null=True,
        blank=True,
        help_text='Livestock image'
    )
    image_alt_text = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text='Alternative text for image accessibility'
    )
    
    # Add this method to get full image URL
    def get_image_url(self):
        if self.image_url:
            return self.image_url.url
        return None
    
    class Meta:
        db_table = 'livestock'
        ordering = ['name']
"""

# Django settings.py configuration:
"""
# Media files (User uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Pillow for image processing
INSTALLED_APPS = [
    # ... other apps ...
    'api',  # Your app
]

# Image upload settings
DATA_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10 MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10 MB

# Allowed image extensions
IMAGE_ALLOWED_FORMATS = ['JPEG', 'PNG', 'GIF', 'WEBP']
"""

# urls.py configuration:
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('api/', include('api.urls_images')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
"""
