import { ReactNode } from 'react'

/**
 * Full-screen themed background image with a readable overlay.
 * Sits behind everything on the page (fixed, -z-10) so the sidebar / cards
 * float on top of a beautiful themed hero.
 *
 * Usage:
 *   <PageBackdrop image="https://..." overlay="from-leaf-900/85 via-leaf-800/70 to-earth-900/85" />
 */
export default function PageBackdrop({
  image,
  overlay = 'from-leaf-900/80 via-earth-900/60 to-earth-900/85',
  children,
}: {
  image: string
  overlay?: string
  children?: ReactNode
}) {
  return (
    <>
      <div
        aria-hidden
        className="fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${image}")` }}
      />
      <div
        aria-hidden
        className={`fixed inset-0 -z-10 bg-gradient-to-br ${overlay}`}
      />
      {children}
    </>
  )
}

/** Curated themed images per screen. Swap freely — all Unsplash CDN, no key needed. */
export const BACKDROPS = {
  dashboard:
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=2000&q=80', // Kenyan patchwork farmland aerial
  crops:
    'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=2000&q=80', // lush green maize field
  livestock:
    'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=2000&q=80', // cattle grazing savanna
  diseases:
    'https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?auto=format&fit=crop&w=2000&q=80', // withered, cracked dry crops
  climate:
    'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=2000&q=80', // Kenyan landscape / Mt Kenya region
  ai:
    'https://images.unsplash.com/photo-1655720828018-edd2daec9349?auto=format&fit=crop&w=2000&q=80', // tech + nature
  admin:
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=2000&q=80', // analytics dashboards
  auth:
    'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=2000&q=80', // sunrise over farm
}
