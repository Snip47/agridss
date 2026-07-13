/**
 * Background Image URLs for AgriDSS Dashboards
 * Using FREE, high-quality images from Pexels, Pixabay, and Unsplash
 * All images are CC0 licensed (free to use)
 */

export const backgroundImages = {
  // Dashboard - General farm/agriculture theme
  dashboard: [
    'https://images.pexels.com/photos/2422296/pexels-photo-2422296.jpeg?auto=compress&cs=tinysrgb&w=1600', // Green fields
    'https://images.pexels.com/photos/1084899/pexels-photo-1084899.jpeg?auto=compress&cs=tinysrgb&w=1600', // Sunrise over farm
  ],

  // Crop Advisor - Lush green crops, diverse varieties
  crops: [
    'https://images.pexels.com/photos/3735857/pexels-photo-3735857.jpeg?auto=compress&cs=tinysrgb&w=1600', // Maize field
    'https://images.pexels.com/photos/6585208/pexels-photo-6585208.jpeg?auto=compress&cs=tinysrgb&w=1600', // Vegetable garden
    'https://images.pexels.com/photos/3958828/pexels-photo-3958828.jpeg?auto=compress&cs=tinysrgb&w=1600', // Wheat field
    'https://images.pexels.com/photos/2143477/pexels-photo-2143477.jpeg?auto=compress&cs=tinysrgb&w=1600', // Green farm rows
  ],

  // Livestock Advisor - Animals in pastoral settings, farm animals
  livestock: [
    'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1600', // Cattle grazing
    'https://images.pexels.com/photos/3945671/pexels-photo-3945671.jpeg?auto=compress&cs=tinysrgb&w=1600', // Sheep in field
    'https://images.pexels.com/photos/3807508/pexels-photo-3807508.jpeg?auto=compress&cs=tinysrgb&w=1600', // Goats grazing
    'https://images.pexels.com/photos/2324045/pexels-photo-2324045.jpeg?auto=compress&cs=tinysrgb&w=1600', // Farm livestock
  ],

  // Disease Diagnosis - Warning theme, pest/disease awareness
  // Using controlled, educational imagery (not graphic)
  diseases: [
    'https://images.pexels.com/photos/2828859/pexels-photo-2828859.jpeg?auto=compress&cs=tinysrgb&w=1600', // Damaged crops
    'https://images.pexels.com/photos/1907963/pexels-photo-1907963.jpeg?auto=compress&cs=tinysrgb&w=1600', // Plant close-up
    'https://images.pexels.com/photos/3719510/pexels-photo-3719510.jpeg?auto=compress&cs=tinysrgb&w=1600', // Agricultural concern
  ],

  // Climate & Location Advisor - Kenya landscapes, climate zones
  climate: [
    'https://images.pexels.com/photos/1570473/pexels-photo-1570473.jpeg?auto=compress&cs=tinysrgb&w=1600', // Green hills (high rainfall zones)
    'https://images.pexels.com/photos/1376355/pexels-photo-1376355.jpeg?auto=compress&cs=tinysrgb&w=1600', // Dry landscape (arid zones)
    'https://images.pexels.com/photos/2296237/pexels-photo-2296237.jpeg?auto=compress&cs=tinysrgb&w=1600', // Landscape transition
    'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=1600', // Valley/terrain
  ],

  // AI Advisor - Tech theme, futuristic
  ai: [
    'https://images.pexels.com/photos/3888151/pexels-photo-3888151.jpeg?auto=compress&cs=tinysrgb&w=1600', // Tech background
    'https://images.pexels.com/photos/577012/pexels-photo-577012.jpeg?auto=compress&cs=tinysrgb&w=1600', // Digital world
    'https://images.pexels.com/photos/325111/pexels-photo-325111.jpeg?auto=compress&cs=tinysrgb&w=1600', // Innovation
  ],

  // Admin Panel - Professional/industrial
  admin: [
    'https://images.pexels.com/photos/3872357/pexels-photo-3872357.jpeg?auto=compress&cs=tinysrgb&w=1600', // Dashboard/analytics
    'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1600', // Team working
  ],
};

/**
 * Get a random background image for a given page
 * @param page - The page identifier (dashboard, crops, livestock, etc.)
 * @returns A background image URL
 */
export function getBackgroundImage(page: keyof typeof backgroundImages): string {
  const images = backgroundImages[page];
  if (!images || images.length === 0) {
    // Fallback to dashboard
    return backgroundImages.dashboard[0];
  }
  return images[Math.floor(Math.random() * images.length)];
}

/**
 * Get all background images for a page
 * @param page - The page identifier
 * @returns Array of background image URLs
 */
export function getAllBackgroundImages(page: keyof typeof backgroundImages): string[] {
  return backgroundImages[page] || backgroundImages.dashboard;
}
