import { useCallback, useRef, useState } from 'react'
import api from './api'

export interface DetectedLocation {
  county: string
  constituency: string
  ward: string
  approximate?: boolean
}

export type LocationStatus = 'idle' | 'detecting' | 'success' | 'denied' | 'unsupported' | 'error'

function getPosition(opts: PositionOptions): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, opts))
}

/**
 * Reads the device GPS and asks the API which county / constituency / ward it falls in.
 * Only the three names are kept; the coordinates are never stored.
 */
export function useAutoLocation(onDetected?: (loc: DetectedLocation) => void) {
  const [status, setStatus] = useState<LocationStatus>('idle')
  const [location, setLocation] = useState<DetectedLocation | null>(null)
  const [error, setError] = useState('')
  const cb = useRef(onDetected)
  cb.current = onDetected

  const detect = useCallback(async () => {
    setError('')
    if (!('geolocation' in navigator)) {
      setStatus('unsupported')
      setError('This device or browser cannot share its location.')
      return
    }
    setStatus('detecting')
    try {
      let pos: GeolocationPosition
      try {
        pos = await getPosition({ enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 })
      } catch (e: any) {
        // Permission problems are final; for GPS timeouts retry with network location.
        if (e?.code === 1) throw e
        pos = await getPosition({ enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 })
      }
      const r = await api.post('/location/resolve', { lat: pos.coords.latitude, lng: pos.coords.longitude }, { timeout: 45000 })
      setLocation(r.data)
      setStatus('success')
      cb.current?.(r.data)
    } catch (e: any) {
      if (e?.code === 1) {
        setStatus('denied')
        setError('Location permission is blocked.')
      } else if (e?.code === 2 || e?.code === 3) {
        setStatus('error')
        setError('We could not get your position. Switch on your phone location (GPS) and try again.')
      } else if (e?.response?.data?.detail) {
        setStatus('error')
        setError(typeof e.response.data.detail === 'string' ? e.response.data.detail : 'Could not work out your ward.')
      } else {
        setStatus('error')
        setError('Could not reach the server. It may be waking up, please try again in a few seconds.')
      }
    }
  }, [])

  return { status, location, error, detect }
}

/** True when the browser already has location permission, so we can detect without asking. */
export async function locationAlreadyGranted(): Promise<boolean> {
  try {
    const p = await (navigator as any).permissions?.query({ name: 'geolocation' })
    return p?.state === 'granted'
  } catch {
    return false
  }
}
