import { useState, useEffect } from 'react';

interface Crop {
  id: number;
  name: string;
  category: string;
  subcategory?: string;
  description?: string;
  image_url?: string;
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
  varieties?: string;
  diseases?: string;
  best_counties?: string;
}

export const useCropDetails = (cropId?: number) => {
  const [crop, setCrop] = useState<Crop | null>(null);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  // Fetch all crops
  const fetchCrops = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/crops/list`);
      if (!response.ok) throw new Error('Failed to fetch crops');
      const data = await response.json();
      setCrops(data.crops || data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch single crop details
  const fetchCropDetails = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/crops/${id}`);
      if (!response.ok) throw new Error('Failed to fetch crop details');
      const data = await response.json();
      setCrop(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cropId) {
      fetchCropDetails(cropId);
    } else {
      fetchCrops();
    }
  }, [cropId]);

  return { crop, crops, loading, error, fetchCrops, fetchCropDetails };
};
