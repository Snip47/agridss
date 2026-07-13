# AgriDSS — Themed Backgrounds Pack

Drop these files into your local project's `src/` folder (overwrite the
existing ones). They add a full-screen, themed hero image behind every
page — no build/config changes needed.

## What changed

**New file**
- `src/components/PageBackdrop.tsx` — a small component that renders a
  fixed, full-viewport background image with a green/earth gradient
  overlay so text stays readable. Also exports `BACKDROPS`, a map of the
  themed image URLs (all Unsplash CDN, no API key).

**Modified files**
- `src/components/Layout.tsx` — sidebar is now slightly translucent with
  a blur so the themed hero peeks through; the main content area's solid
  cream background was removed so the backdrop shows through.
- `src/pages/Dashboard.tsx` → Kenyan patchwork farmland aerial
- `src/pages/CropAdvisor.tsx` → lush green maize field
- `src/pages/LivestockAdvisor.tsx` → cattle grazing the savanna
- `src/pages/DiseaseDiagnosis.tsx` → withered, cracked dry crops
- `src/pages/ClimateAdvisor.tsx` → Kenyan highlands / Mt Kenya landscape
- `src/pages/AIAdvisor.tsx` → tech + nature blend
- `src/pages/AdminPanel.tsx` → analytics dashboards
- `src/pages/Login.tsx` and `src/pages/Register.tsx` → sunrise over farm

## Swapping any image

Open `src/components/PageBackdrop.tsx` and edit the URL next to the key
you want to change, e.g.:

```ts
export const BACKDROPS = {
  crops: 'https://images.unsplash.com/photo-XXXX?auto=format&fit=crop&w=2000&q=80',
  ...
}
```

You can also override per-page inline:

```tsx
<PageBackdrop image="https://your-image.jpg" overlay="from-black/70 to-black/40" />
```

## Overlay tuning

The overlay is a Tailwind gradient. Increase the alpha values (`/80`,
`/90`) if text becomes hard to read on a bright image, or drop them
(`/40`) to let the photo shine more.
