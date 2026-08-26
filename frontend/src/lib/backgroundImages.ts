/**
 * Per-page background images from Unsplash
 * Each page has a relevant background
 */
export const PAGE_BACKGROUNDS: Record<string, string> = {
  dashboard:  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1920&q=80&fit=crop',
  crops:      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80&fit=crop',
  livestock:  'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=1920&q=80&fit=crop',
  diseases:   'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920&q=80&fit=crop',
  climate:    'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=1920&q=80&fit=crop',
  ai:         'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1920&q=80&fit=crop',
  login:      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80&fit=crop',
  admin:      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1920&q=80&fit=crop',
}

export function getBackground(page: string): string {
  return PAGE_BACKGROUNDS[page] || PAGE_BACKGROUNDS.dashboard
}
