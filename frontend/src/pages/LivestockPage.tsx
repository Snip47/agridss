import React, { useState } from 'react';
import AnimalCard from '../components/AnimalCard';
import DetailModal from '../components/DetailModal';
import { useAnimalDetails } from '../hooks/useAnimalDetails';

interface SelectedAnimal {
  id: number;
  name: string;
  category: string;
  purpose?: string;
  image_url?: string;
  description?: string;
  water_requirement?: string;
  space_required?: string;
  feeding_guide?: string;
  housing_requirements?: string;
  vaccination_schedule?: string;
  breeding_info?: string;
  market_info?: string;
  suitable_aez?: string;
  common_diseases?: string;
  breeds?: string;
  [key: string]: any;
}

export default function LivestockPage() {
  const { animals, loading, error } = useAnimalDetails();
  const [selectedAnimal, setSelectedAnimal] = useState<SelectedAnimal | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPurpose, setSelectedPurpose] = useState('all');

  const handleAnimalClick = (animal: any) => {
    setSelectedAnimal(animal);
    setModalOpen(true);
  };

  // Get unique categories and purposes
  const categories = ['all', ...new Set(animals.map(a => a.category))];
  const purposes = ['all', ...new Set(animals.filter(a => a.purpose).map(a => a.purpose))];

  // Filter animals
  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (animal.description && animal.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || animal.category === selectedCategory;
    const matchesPurpose = selectedPurpose === 'all' || animal.purpose === selectedPurpose;
    return matchesSearch && matchesCategory && matchesPurpose;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🐄 Livestock & Animal Husbandry</h1>
          <p className="text-gray-600">Explore livestock varieties with detailed care and breeding information</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search Bar */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search Livestock</label>
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Purpose Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Purpose</label>
              <select
                value={selectedPurpose}
                onChange={(e) => setSelectedPurpose(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {purposes.map(purpose => (
                  <option key={purpose} value={purpose}>
                    {purpose === 'all' ? 'All Purposes' : purpose.charAt(0).toUpperCase() + purpose.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold">{filteredAnimals.length}</span> of{' '}
            <span className="font-semibold">{animals.length}</span> livestock
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700">Error loading livestock: {error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Loading livestock...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredAnimals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No livestock found matching your criteria</p>
          </div>
        )}

        {/* Livestock Grid */}
        {!loading && filteredAnimals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAnimals.map(animal => (
              <AnimalCard
                key={animal.id}
                id={animal.id}
                name={animal.name}
                category={animal.category}
                purpose={animal.purpose}
                image_url={animal.image_url}
                description={animal.description}
                onClick={() => handleAnimalClick(animal)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedAnimal && (
        <DetailModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedAnimal(null);
          }}
          title={selectedAnimal.name}
          image_url={selectedAnimal.image_url}
          details={selectedAnimal}
          type="animal"
        />
      )}
    </div>
  );
}
