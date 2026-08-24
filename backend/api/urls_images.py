"""
API endpoints for handling image uploads and management
"""
from django.urls import path
from . import views

urlpatterns = [
    # Crop image endpoints
    path('crops/<int:crop_id>/upload-image/', views.upload_crop_image, name='upload_crop_image'),
    path('crops/<int:crop_id>/image/', views.get_crop_image, name='get_crop_image'),
    path('crops/<int:crop_id>/delete-image/', views.delete_crop_image, name='delete_crop_image'),
    
    # Livestock image endpoints
    path('livestock/<int:livestock_id>/upload-image/', views.upload_livestock_image, name='upload_livestock_image'),
    path('livestock/<int:livestock_id>/image/', views.get_livestock_image, name='get_livestock_image'),
    path('livestock/<int:livestock_id>/delete-image/', views.delete_livestock_image, name='delete_livestock_image'),
]
