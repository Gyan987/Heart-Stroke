import React, { useEffect, useRef } from 'react'

// MapView attempts to load Google Maps if VITE_GOOGLE_MAPS_API_KEY is provided.
export default function MapView({ lat, lng }) {
  const mapRef = useRef()

  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!key) return

    // create script if not present
    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
      script.async = true
      script.onload = () => initMap()
      document.head.appendChild(script)
    } else {
      initMap()
    }

    function initMap() {
      if (!mapRef.current || !window.google) return
      const center = { lat: lat || 40.7128, lng: lng || -74.006 }
      const map = new window.google.maps.Map(mapRef.current, { center, zoom: 13 })
      // add marker for user
      new window.google.maps.Marker({ position: center, map, title: 'You' })
      // place a simple nearby hospitals search if Places available
      try {
        const service = new window.google.maps.places.PlacesService(map)
        const req = { location: center, radius: 5000, type: ['hospital'] }
        service.nearbySearch(req, (results) => {
          results && results.slice(0, 6).forEach((r) => {
            new window.google.maps.Marker({ position: r.geometry.location, map, title: r.name })
          })
        })
      } catch (e) {
        // ignore
      }
    }
  }, [lat, lng])

  return <div ref={mapRef} style={{ width: '100%', height: 300 }} className="rounded" />
}
