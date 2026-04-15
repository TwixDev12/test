'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Fonction pour créer une icône personnalisée
const createCustomIcon = (type) => {
  const iconColors = {
    city: '#3b82f6',
    military: '#ef4444',
    hospital: '#22c55e',
    landmark: '#eab308'
  }

  const iconHtml = `
    <div style="
      background-color: ${iconColors[type]};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        ${type === 'city' ? '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>' : ''}
        ${type === 'military' ? '<path d="M11.5 2.5 3 7v6c0 5.5 3.5 7.9 8.5 8.5 5-0.6 8.5-3 8.5-8.5V7l-8.5-4.5Z"/>' : ''}
        ${type === 'hospital' ? '<path d="M12 2L2 7v10c0 5.5 4.5 10 10 10s10-4.5 10-10V7l-10-5z"/><path d="M12 8v8"/><path d="M8 12h8"/>' : ''}
        ${type === 'landmark' ? '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>' : ''}
      </svg>
    </div>
  `

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  })
}

const getLootQualityBadge = (quality) => {
  const badges = {
    'low': { color: 'bg-gray-500', text: 'Loot Faible' },
    'medium': { color: 'bg-yellow-500', text: 'Loot Moyen' },
    'high': { color: 'bg-blue-500', text: 'Loot Élevé' },
    'military': { color: 'bg-red-500', text: 'Loot Militaire' },
    'medical': { color: 'bg-green-500', text: 'Loot Médical' }
  }
  return badges[quality] || badges.medium
}

export default function InteractiveMap({ markers, mapName }) {
  // Centre de la carte (coordonnées approximatives)
  const mapCenter = [52, 11]
  const mapZoom = 7

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; DayZ Map'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        
        {markers.map((marker) => {
          const badge = getLootQualityBadge(marker.lootQuality)
          return (
            <Marker
              key={marker.id}
              position={marker.coordinates}
              icon={createCustomIcon(marker.type)}
            >
              <Popup>
                <div className="min-w-[200px] p-2">
                  <h3 className="font-bold text-lg mb-2">{marker.name}</h3>
                  <div className="mb-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs text-white ${badge.color}`}>
                      {badge.text}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {marker.description}
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    <strong>Type:</strong> {marker.type}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}