import React from 'react';
import { AlertCircle } from 'lucide-react';

interface AnimalCardProps {
  id: number;
  name: string;
  category: string;
  purpose?: string;
  image_url?: string;
  description?: string;
  onClick: () => void;
}

export default function AnimalCard({
  id,
  name,
  category,
  purpose,
  image_url,
  description,
  onClick,
}: AnimalCardProps) {
  const [imageError, setImageError] = React.useState(false);

  const defaultImage = 'https://images.unsplash.com/photo-1560807707-95cc3612b587?w=400&q=80';
  const displayImage = !imageError && image_url ? image_url : defaultImage;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden h-full flex flex-col"
    >
      {/* Image Container */}
      <div className="relative w-full h-48 bg-gray-100 overflow-hidden group">
        <img
          src={displayImage}
          alt={name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <AlertCircle className="text-gray-400" size={32} />
          </div>
        )}
        {/* Category Badge */}
        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full capitalize">
          {category}
        </div>
        {purpose && (
          <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full capitalize">
            {purpose}
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-2">{name}</h3>
        {description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-grow">
            {description}
          </p>
        )}
        <button className="mt-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition w-full">
          View Details
        </button>
      </div>
    </div>
  );
}
