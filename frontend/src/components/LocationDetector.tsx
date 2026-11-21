import { useEffect } from 'react'
import { MapPin, Loader2 } from 'lucide-react'
import { DetectedLocation, useAutoLocation, locationAlreadyGranted } from '../lib/useAutoLocation'

interface Props {
  /** Location already known (e.g. saved on the profile). */
  value?: DetectedLocation | null
  onDetected: (loc: DetectedLocation) => void
  /** Detect straight away if the browser already allows location. */
  autoIfGranted?: boolean
}

/**
 * One-tap location: the farmer switches on location and taps the button.
 * County, constituency and ward are filled in automatically; there is no manual entry.
 */
export default function LocationDetector({ value, onDetected, autoIfGranted }: Props) {
  const { status, location, error, detect } = useAutoLocation(onDetected)
  const shown = location || value || null
  const busy = status === 'detecting'

  useEffect(() => {
    if (!autoIfGranted || value) return
    locationAlreadyGranted().then(ok => { if (ok) detect() })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      {shown ? (
        <div className="alert alert-ok" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 10 }}>
            <MapPin size={16} /> Your farm location
          </div>
          <div className="kv" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div><div className="k">County</div><div className="v">{shown.county}</div></div>
            <div><div className="k">Constituency</div><div className="v">{shown.constituency}</div></div>
            <div><div className="k">Ward</div><div className="v">{shown.ward}</div></div>
          </div>
          {location?.approximate && (
            <div style={{ fontSize: 12, marginTop: 8 }}>You are close to a ward boundary, so this is the nearest ward.</div>
          )}
        </div>
      ) : (
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 12 }}>
          Switch on location on your phone, then tap the button. We find your county, constituency and ward for you.
        </p>
      )}

      {status === 'denied' && (
        <div className="alert alert-error">
          Location is blocked for this site. Tap the lock or location icon in your browser address bar, set Location to
          Allow, then tap Try again.
        </div>
      )}
      {(status === 'error' || status === 'unsupported') && <div className="alert alert-error">{error}</div>}

      <button type="button" className={shown ? 'btn btn-outline' : 'btn btn-primary'} onClick={detect} disabled={busy}>
        {busy ? <Loader2 size={16} className="spin" /> : <MapPin size={16} />}
        {busy ? 'Detecting your location...' : status === 'denied' || status === 'error' ? 'Try again' : shown ? 'Update my location' : 'Detect my location'}
      </button>
    </div>
  )
}
