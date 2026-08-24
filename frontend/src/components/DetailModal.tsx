import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  image_url?: string;
  details: {
    category?: string;
    description?: string;
    purpose?: string;
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
    feeding_guide?: string;
    housing_requirements?: string;
    vaccination_schedule?: string;
    breeding_info?: string;
    market_info?: string;
    space_required?: string;
    soil_types?: string;
    [key: string]: any;
  };
  type: 'crop' | 'animal';
}

export default function DetailModal({
  isOpen,
  onClose,
  title,
  image_url,
  details,
  type,
}: DetailModalProps) {
  const [imageError, setImageError] = useState(false);

  if (!isOpen) return null;

  const defaultImage = type === 'crop'
    ? 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80'
    : 'https://images.unsplash.com/photo-1560807707-95cc3612b587?w=800&q=80';

  const displayImage = !imageError && image_url ? image_url : defaultImage;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full z-10"
        >
          <X size={24} className="text-gray-600" />
        </button>

        {/* Image Section */}
        <div className="relative w-full bg-gray-100 h-96 overflow-hidden">
          <img
            src={displayImage}
            alt={title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <div className="text-center">
                <AlertCircle className="mx-auto text-gray-500 mb-2" />
                <p className="text-gray-600">Image unavailable</p>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{title}</h2>
          
          {details.category && (
            <p className="text-lg text-green-600 font-semibold mb-4 capitalize">
              {details.category}
            </p>
          )}

          {details.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{details.description}</p>
            </div>
          )}

          {/* Crop-specific details */}
          {type === 'crop' && (
            <div className="space-y-6">
              {details.planting_months && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">🌱 Planting Months</h4>
                  <p className="text-gray-600">{details.planting_months}</p>
                </div>
              )}

              {details.maturity_days && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">⏱️ Maturity Period</h4>
                  <p className="text-gray-600">{details.maturity_days} days</p>
                </div>
              )}

              {details.water_requirement && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">💧 Water Requirement</h4>
                  <p className="text-gray-600">{details.water_requirement}</p>
                </div>
              )}

              {(details.rainfall_min_mm || details.rainfall_max_mm) && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">🌧️ Rainfall Requirements</h4>
                  <p className="text-gray-600">
                    {details.rainfall_min_mm}mm - {details.rainfall_max_mm}mm annually
                  </p>
                </div>
              )}

              {(details.altitude_min_m || details.altitude_max_m) && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">⛰️ Altitude Range</h4>
                  <p className="text-gray-600">
                    {details.altitude_min_m}m - {details.altitude_max_m}m
                  </p>
                </div>
              )}

              {details.suitable_aez && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">📍 Suitable Areas</h4>
                  <p className="text-gray-600">{details.suitable_aez}</p>
                </div>
              )}

              {details.soil_types && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">🌍 Soil Types</h4>
                  <p className="text-gray-600">{details.soil_types}</p>
                </div>
              )}

              {details.care_tips && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">🌿 Care Tips</h4>
                  <p className="text-gray-600">{details.care_tips}</p>
                </div>
              )}

              {details.expected_yield && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">📊 Expected Yield</h4>
                  <p className="text-gray-600">{details.expected_yield}</p>
                </div>
              )}

              {details.market_price_ksh && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">💰 Market Price</h4>
                  <p className="text-gray-600">{details.market_price_ksh} KSh</p>
                </div>
              )}
            </div>
          )}

          {/* Livestock-specific details */}
          {type === 'animal' && (
            <div className="space-y-6">
              {details.purpose && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">🎯 Purpose</h4>
                  <p className="text-gray-600 capitalize">{details.purpose}</p>
                </div>
              )}

              {details.water_requirement && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">💧 Water Requirement</h4>
                  <p className="text-gray-600">{details.water_requirement}</p>
                </div>
              )}

              {details.space_required && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">🏠 Space Required</h4>
                  <p className="text-gray-600">{details.space_required}</p>
                </div>
              )}

              {details.feeding_guide && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">🍽️ Feeding Guide</h4>
                  <p className="text-gray-600">{details.feeding_guide}</p>
                </div>
              )}

              {details.housing_requirements && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">🏘️ Housing Requirements</h4>
                  <p className="text-gray-600">{details.housing_requirements}</p>
                </div>
              )}

              {details.vaccination_schedule && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">💉 Vaccination Schedule</h4>
                  <p className="text-gray-600">{details.vaccination_schedule}</p>
                </div>
              )}

              {details.breeding_info && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">🐾 Breeding Information</h4>
                  <p className="text-gray-600">{details.breeding_info}</p>
                </div>
              )}

              {details.market_info && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">💰 Market Information</h4>
                  <p className="text-gray-600">{details.market_info}</p>
                </div>
              )}

              {details.suitable_aez && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">📍 Suitable Areas</h4>
                  <p className="text-gray-600">{details.suitable_aez}</p>
                </div>
              )}
            </div>
          )}

          {/* Close Button at Bottom */}
          <button
            onClick={onClose}
            className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
