import React, { useState } from 'react';
import CropCard from '../components/CropCard';
import DetailModal from '../components/DetailModal';
import { useCropDetails } from '../hooks/useCropDetails';

interface SelectedCrop {
  id: number;
  name: string;
  category: string;
  image_url?: string;
  description?: string;
  water_requirement?: string;
  rainfall_min_mm?: number;
  rainfall_max_mm?: number;
  altitude_min_m?: number;
  altitude_max_m?: number;
  maturity_days?: number;
  suitable_aez?: string;
  planting_months?: string;
  care_tips?: string;
  expected_yield?: string;
  market_price_ksh?: string;
  soil_types?: string;
  [key: string]: any;
}

export default function CropsPage() {
  const { crops, loading, error } = useCropDetails();
  const [selectedCrop, setSelectedCrop] = useState<SelectedCrop | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleCropClick = (crop: any) => {
    setSelectedCrop(crop);
    setModalOpen(true);
  };

  // Get unique categories
  const categories = ['all', ...new Set(crops.map(c => c.category))];

  // Filter crops
  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (crop.description && crop.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || crop.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🌾 Crops & Cultivation</h1>
          <p className="text-gray-600">Explore crop varieties with detailed information and images</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Search Bar */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search Crops</label>
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredCrops.length}</span> of{' '}
            <span className="font-semibold">{crops.length}</span> crops
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700">Error loading crops: {error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            <p className="mt-4 text-gray-600">Loading crops...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCrops.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No crops found matching your criteria</p>
          </div>
        )}

        {/* Crops Grid */}
        {!loading && filteredCrops.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCrops.map(crop => (
              <CropCard
                key={crop.id}
                id={crop.id}
                name={crop.name}
                category={crop.category}
                image_url={crop.image_url}
                description={crop.description}
                onClick={() => handleCropClick(crop)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedCrop && (
        <DetailModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedCrop(null);
          }}
          title={selectedCrop.name}
          image_url={selectedCrop.image_url}
          details={selectedCrop}
          type="crop"
        />
      )}
    </div>
  );
}
