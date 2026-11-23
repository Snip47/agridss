import { useState } from 'react'
import { useAuth } from '../lib/auth'
import LocationDetector from './LocationDetector'
import type { DetectedLocation } from '../lib/useAutoLocation'

/** Shown to farmers whose account has no location yet. They cannot use the app until it is set. */
export default function LocationRequired() {
  const { updateProfile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const save = async (l: DetectedLocation) => {
    setSaving(true); setError('')
    try { await updateProfile({ county: l.county, constituency: l.constituency, ward: l.ward }) }
    catch { setError('We could not save your location. Please try again.'); setSaving(false) }
  }

  return (
    <div className="wrap" style={{ maxWidth: 560, paddingTop: 32 }}>
      <div className="card card-pad fade">
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Set your farm location</h1>
        <p className="prose" style={{ margin: '8px 0 18px' }}>
          AgriDSS needs your location to give advice that fits your farm. Switch on location on your phone and tap the button. This step is required.
        </p>
        <LocationDetector onDetected={save} />
        {saving && <p style={{ marginTop: 12, fontSize: 14, color: 'var(--muted)' }}>Saving your location...</p>}
        {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}
      </div>
    </div>
  )
}
