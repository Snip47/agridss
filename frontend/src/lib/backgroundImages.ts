export const BACKGROUNDS: Record<string, string[]> = {
  dashboard: [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=85',
    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1920&q=85',
    'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1920&q=85',
  ],
  crops: [
    'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1920&q=85',
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&q=85',
    'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1920&q=85',
    'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=1920&q=85',
  ],
  livestock: [
    'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1920&q=85',
    'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=1920&q=85',
    'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=1920&q=85',
    'https://images.unsplash.com/photo-1549945676-891cd9e37de6?w=1920&q=85',
  ],
  diseases: [
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1920&q=85',
    'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1920&q=85',
    'https://images.unsplash.com/photo-1444392061186-9fc38786c43e?w=1920&q=85',
  ],
  climate: [
    'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&q=85',
    'https://images.unsplash.com/photo-1504608524841-42584120d693?w=1920&q=85',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1920&q=85',
  ],
  ai: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1920&q=85',
    'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1920&q=85',
  ],
  admin: [
    'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1920&q=85',
  ],
  login: [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=85',
    'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=1920&q=85',
  ],
}

export const PAGE_BG_MAP: Record<string, string> = {
  '/': 'dashboard',
  '/crops': 'crops',
  '/livestock': 'livestock',
  '/diseases': 'diseases',
  '/climate': 'climate',
  '/ai': 'ai',
  '/admin': 'admin',
}

export function getBackground(page: string): string {
  const imgs = BACKGROUNDS[page] || BACKGROUNDS.dashboard
  return imgs[Math.floor(Math.random() * imgs.length)]
}
