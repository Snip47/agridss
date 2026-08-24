import React, { useState } from 'react';
import ImageUpload from '../components/ImageUpload';

interface ImageUploadFormProps {
  onSubmit: (data: { name: string; category: string; image: File; description?: string }) => void;
  loading?: boolean;
  type: 'crop' | 'animal';
}

export default function ImageUploadForm({ onSubmit, loading = false, type }: ImageUploadFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');

  const categories = type === 'crop'
    ? ['Cereals', 'Legumes', 'Root Crops', 'Vegetables', 'Fruits', 'Herbs']
    : ['Cattle', 'Poultry', 'Sheep', 'Goats', 'Pigs', 'Rabbits', 'Fish'];

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage || !formData.name || !formData.category) {
      alert('Please fill all required fields');
      return;
    }
    onSubmit({
      ...formData,
      image: selectedImage,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Upload {type === 'crop' ? 'Crop' : 'Livestock'} Image
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Image *
          </label>
          <ImageUpload
            onImageSelect={handleImageSelect}
            preview={preview}
            disabled={loading}
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder={`Enter ${type} name`}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            disabled={loading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat.toLowerCase()}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={`Enter ${type} description`}
            disabled={loading}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
        >
          {loading ? 'Uploading...' : `Upload ${type === 'crop' ? 'Crop' : 'Livestock'}`}
        </button>
      </form>
    </div>
  );
}
