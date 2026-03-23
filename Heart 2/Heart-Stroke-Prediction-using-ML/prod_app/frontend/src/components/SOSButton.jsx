import React, { useState } from 'react'
import MapView from './MapView'

export default function SOSButton() {
  const [coords, setCoords] = useState(null)
  const [showMap, setShowMap] = useState(false)

  function openMapsFallback(lat, lng) {
    const url = `https://www.google.com/maps/search/hospital/@${lat},${lng},13z`;
    window.open(url, '_blank')
  }

  function handleSOS() {
    if (!navigator.geolocation) {
      alert('Geolocation not available')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setCoords({ lat, lng })
        const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        if (key) {
          setShowMap(true)
        } else {
          openMapsFallback(lat, lng)
        }
      },
      (err) => {
        alert('Could not get location: ' + err.message)
      }
    )
  }

  return (
    <div>
      <button onClick={handleSOS} className="btn btn-primary">SOS - Find nearby hospitals</button>
      {showMap && coords && (
        <div className="mt-3">
          <MapView lat={coords.lat} lng={coords.lng} />
          <div className="mt-2">
            <a className="btn" href={`tel:112`}>Call Emergency</a>
            <a className="btn ml-2" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/hospital/@${coords.lat},${coords.lng},13z`}>Open in Google Maps</a>
          </div>
        </div>
      )}
    </div>
  )
}
