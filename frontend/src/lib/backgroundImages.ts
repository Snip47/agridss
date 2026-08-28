const PAGE_IMAGES: Record<string,string> = {
  '/':          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=60',
  '/climate':   'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?auto=format&fit=crop&w=1920&q=60',
  '/crops':     'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1920&q=60',
  '/livestock': 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1920&q=60',
  '/diseases':  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1920&q=60',
  '/ai':        'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1920&q=60',
  '/admin':     'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1920&q=60',
  'login':      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=60',
}

const PAGE_GRADIENTS: Record<string,string> = {
  '/':          'linear-gradient(135deg,#052e16 0%,#14532d 40%,#1e3a5f 100%)',
  '/climate':   'linear-gradient(135deg,#0c4a6e 0%,#164e63 40%,#052e16 100%)',
  '/crops':     'linear-gradient(135deg,#052e16 0%,#166534 40%,#14532d 100%)',
  '/livestock': 'linear-gradient(135deg,#451a03 0%,#78350f 40%,#1c1917 100%)',
  '/diseases':  'linear-gradient(135deg,#4c0519 0%,#7f1d1d 40%,#1c1917 100%)',
  '/ai':        'linear-gradient(135deg,#2e1065 0%,#4c1d95 40%,#1e1b4b 100%)',
  '/admin':     'linear-gradient(135deg,#0f172a 0%,#1e293b 40%,#0f172a 100%)',
  'login':      'linear-gradient(135deg,#052e16 0%,#14532d 40%,#1e3a5f 100%)',
}

export function getImageForPath(pathname: string): string {
  if (PAGE_IMAGES[pathname]) return PAGE_IMAGES[pathname]
  for (const key of Object.keys(PAGE_IMAGES)) {
    if (key !== '/' && pathname.startsWith(key)) return PAGE_IMAGES[key]
  }
  return PAGE_IMAGES['/']
}

export function getGradientForPath(pathname: string): string {
  if (PAGE_GRADIENTS[pathname]) return PAGE_GRADIENTS[pathname]
  for (const key of Object.keys(PAGE_GRADIENTS)) {
    if (key !== '/' && pathname.startsWith(key)) return PAGE_GRADIENTS[key]
  }
  return PAGE_GRADIENTS['/']
}

export function getBackground(key: string): string {
  return PAGE_IMAGES[key] || PAGE_IMAGES['/']
}
