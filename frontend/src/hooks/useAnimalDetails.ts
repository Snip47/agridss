import { useState, useEffect } from 'react';

interface Animal {
  id: number;
  name: string;
  category: string;
  purpose?: string;
  description?: string;
  image_url?: string;
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
}

export const useAnimalDetails = (animalId?: number) => {
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  // Fetch all animals
  const fetchAnimals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/livestock/list`);
      if (!response.ok) throw new Error('Failed to fetch livestock');
      const data = await response.json();
      setAnimals(data.livestock || data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch single animal details
  const fetchAnimalDetails = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/livestock/${id}`);
      if (!response.ok) throw new Error('Failed to fetch livestock details');
      const data = await response.json();
      setAnimal(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (animalId) {
      fetchAnimalDetails(animalId);
    } else {
      fetchAnimals();
    }
  }, [animalId]);

  return { animal, animals, loading, error, fetchAnimals, fetchAnimalDetails };
};
