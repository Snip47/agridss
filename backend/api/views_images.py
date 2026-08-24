"""
Views for handling image uploads and management
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from PIL import Image
import io
import os
from .models import Crop, Livestock

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_FORMATS = ['JPEG', 'PNG', 'GIF', 'WEBP']
THUMBNAIL_SIZE = (400, 400)


def optimize_image(image_file):
    """Optimize image for web"""
    img = Image.open(image_file)
    
    # Convert RGBA to RGB if necessary
    if img.mode in ('RGBA', 'LA', 'P'):
        rgb_img = Image.new('RGB', img.size, (255, 255, 255))
        rgb_img.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
        img = rgb_img
    
    # Resize if too large
    img.thumbnail((1920, 1920), Image.Resampling.LANCZOS)
    
    # Save as JPEG
    img_io = io.BytesIO()
    img.save(img_io, format='JPEG', quality=85, optimize=True)
    img_io.seek(0)
    return img_io


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_crop_image(request, crop_id):
    """Upload image for a crop"""
    try:
        crop = Crop.objects.get(id=crop_id)
    except Crop.DoesNotExist:
        return Response({'error': 'Crop not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if 'image' not in request.FILES:
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    image_file = request.FILES['image']
    
    # Validate file size
    if image_file.size > MAX_IMAGE_SIZE:
        return Response(
            {'error': f'File size exceeds {MAX_IMAGE_SIZE / 1024 / 1024}MB limit'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Validate image format
        img = Image.open(image_file)
        if img.format not in ALLOWED_FORMATS:
            return Response(
                {'error': f'Unsupported format. Allowed: {", ".join(ALLOWED_FORMATS)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Optimize image
        optimized_image = optimize_image(image_file)
        
        # Generate filename
        filename = f'crops/{crop_id}_{crop.name.lower().replace(" ", "_")}.jpg'
        
        # Delete old image if exists
        if crop.image_url:
            old_path = crop.image_url.replace('/media/', '')
            default_storage.delete(old_path)
        
        # Save new image
        path = default_storage.save(filename, ContentFile(optimized_image.getvalue()))
        image_url = f'/media/{path}'
        
        # Update crop
        crop.image_url = image_url
        crop.save()
        
        return Response({
            'success': True,
            'image_url': image_url,
            'message': 'Image uploaded successfully'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_crop_image(request, crop_id):
    """Get crop image URL"""
    try:
        crop = Crop.objects.get(id=crop_id)
        if crop.image_url:
            return Response({'image_url': crop.image_url}, status=status.HTTP_200_OK)
        return Response({'error': 'No image for this crop'}, status=status.HTTP_404_NOT_FOUND)
    except Crop.DoesNotExist:
        return Response({'error': 'Crop not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_crop_image(request, crop_id):
    """Delete crop image"""
    try:
        crop = Crop.objects.get(id=crop_id)
        if crop.image_url:
            old_path = crop.image_url.replace('/media/', '')
            default_storage.delete(old_path)
            crop.image_url = None
            crop.save()
            return Response({'message': 'Image deleted successfully'}, status=status.HTTP_200_OK)
        return Response({'error': 'No image to delete'}, status=status.HTTP_404_NOT_FOUND)
    except Crop.DoesNotExist:
        return Response({'error': 'Crop not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_livestock_image(request, livestock_id):
    """Upload image for livestock"""
    try:
        livestock = Livestock.objects.get(id=livestock_id)
    except Livestock.DoesNotExist:
        return Response({'error': 'Livestock not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if 'image' not in request.FILES:
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    image_file = request.FILES['image']
    
    # Validate file size
    if image_file.size > MAX_IMAGE_SIZE:
        return Response(
            {'error': f'File size exceeds {MAX_IMAGE_SIZE / 1024 / 1024}MB limit'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Validate image format
        img = Image.open(image_file)
        if img.format not in ALLOWED_FORMATS:
            return Response(
                {'error': f'Unsupported format. Allowed: {", ".join(ALLOWED_FORMATS)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Optimize image
        optimized_image = optimize_image(image_file)
        
        # Generate filename
        filename = f'livestock/{livestock_id}_{livestock.name.lower().replace(" ", "_")}.jpg'
        
        # Delete old image if exists
        if livestock.image_url:
            old_path = livestock.image_url.replace('/media/', '')
            default_storage.delete(old_path)
        
        # Save new image
        path = default_storage.save(filename, ContentFile(optimized_image.getvalue()))
        image_url = f'/media/{path}'
        
        # Update livestock
        livestock.image_url = image_url
        livestock.save()
        
        return Response({
            'success': True,
            'image_url': image_url,
            'message': 'Image uploaded successfully'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_livestock_image(request, livestock_id):
    """Get livestock image URL"""
    try:
        livestock = Livestock.objects.get(id=livestock_id)
        if livestock.image_url:
            return Response({'image_url': livestock.image_url}, status=status.HTTP_200_OK)
        return Response({'error': 'No image for this livestock'}, status=status.HTTP_404_NOT_FOUND)
    except Livestock.DoesNotExist:
        return Response({'error': 'Livestock not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_livestock_image(request, livestock_id):
    """Delete livestock image"""
    try:
        livestock = Livestock.objects.get(id=livestock_id)
        if livestock.image_url:
            old_path = livestock.image_url.replace('/media/', '')
            default_storage.delete(old_path)
            livestock.image_url = None
            livestock.save()
            return Response({'message': 'Image deleted successfully'}, status=status.HTTP_200_OK)
        return Response({'error': 'No image to delete'}, status=status.HTTP_404_NOT_FOUND)
    except Livestock.DoesNotExist:
        return Response({'error': 'Livestock not found'}, status=status.HTTP_404_NOT_FOUND)
