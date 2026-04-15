'use client'

import { MapPin, Building2, Shield, Hospital, Landmark as LandmarkIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const getMarkerIcon = (type) => {
  const icons = {
    city: Building2,
    military: Shield,
    hospital: Hospital,
    landmark: LandmarkIcon
  }
  return icons[type] || MapPin
}

const getMarkerColor = (type) => {
  const colors = {
    city: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    military: 'text-red-500 bg-red-500/10 border-red-500/20',
    hospital: 'text-green-500 bg-green-500/10 border-green-500/20',
    landmark: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
  }
  return colors[type] || 'text-gray-500 bg-gray-500/10'
}

const getLootQualityBadge = (quality) => {
  const badges = {
    'low': { color: 'bg-gray-600', text: 'Loot Faible' },
    'medium': { color: 'bg-yellow-600', text: 'Loot Moyen' },
    'high': { color: 'bg-blue-600', text: 'Loot Élevé' },
    'military': { color: 'bg-red-600', text: 'Loot Militaire' },
    'medical': { color: 'bg-green-600', text: 'Loot Médical' }
  }
  return badges[quality] || badges.medium
}

const getTypeLabel = (type) => {
  const labels = {
    city: 'Ville',
    military: 'Zone Militaire',
    hospital: 'Hôpital',
    landmark: 'Point d\'intérêt'
  }
  return labels[type] || type
}

export default function InteractiveMap({ markers, mapName }) {
  const mapTitle = mapName === 'chernarus' ? 'Chernarus' : 'Livonia'

  // Group markers by type
  const groupedMarkers = markers.reduce((acc, marker) => {
    if (!acc[marker.type]) {
      acc[marker.type] = []
    }
    acc[marker.type].push(marker)
    return acc
  }, {})

  // Count stats
  const stats = {
    total: markers.length,
    military: markers.filter(m => m.type === 'military').length,
    cities: markers.filter(m => m.type === 'city').length,
    hospitals: markers.filter(m => m.type === 'hospital').length,
    landmarks: markers.filter(m => m.type === 'landmark').length
  }

  return (
    <div className="w-full space-y-6">
      {/* Map Header */}
      <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent p-6 rounded-lg border border-primary/20">
        <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-primary" />
          Carte de {mapTitle}
        </h3>
        <p className="text-muted-foreground mb-4">
          {stats.total} locations disponibles sur cette carte
        </p>
        <div className="flex gap-4 flex-wrap text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>{stats.cities} Villes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>{stats.military} Zones Militaires</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>{stats.hospitals} Hôpitaux</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>{stats.landmarks} Points d'intérêt</span>
          </div>
        </div>
      </div>

      {/* Markers Grid by Type */}
      <div className="space-y-8">
        {Object.entries(groupedMarkers).map(([type, typeMarkers]) => {
          const Icon = getMarkerIcon(type)
          return (
            <div key={type}>
              <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Icon className={`w-5 h-5 ${getMarkerColor(type).split(' ')[0]}`} />
                {getTypeLabel(type)}s ({typeMarkers.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {typeMarkers.map((marker) => {
                  const badge = getLootQualityBadge(marker.lootQuality)
                  return (
                    <Card 
                      key={marker.id} 
                      className={`hover:border-primary/50 transition-all duration-300 border-2 ${getMarkerColor(type).split(' ').slice(1).join(' ')}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <CardTitle className="text-lg flex items-center gap-2 mb-1">
                              <Icon className={`w-5 h-5 ${getMarkerColor(type).split(' ')[0]}`} />
                              {marker.name}
                            </CardTitle>
                            <Badge className={`${badge.color} text-white text-xs`}>
                              {badge.text}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {marker.description}
                        </p>
                        
                        {/* Loot Types */}
                        {marker.lootTypes && (
                          <div>
                            <h5 className="text-xs font-semibold mb-2 text-primary">🎒 Types de Loot:</h5>
                            <div className="flex flex-wrap gap-1">
                              {marker.lootTypes.map((loot, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {loot}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Buildings */}
                        {marker.buildings && (
                          <div>
                            <h5 className="text-xs font-semibold mb-1 text-primary">🏢 Bâtiments:</h5>
                            <p className="text-xs text-muted-foreground">{marker.buildings}</p>
                          </div>
                        )}
                        
                        {/* Danger Level */}
                        {marker.danger && (
                          <div>
                            <h5 className="text-xs font-semibold mb-1 text-primary">⚠️ Danger:</h5>
                            <p className="text-xs text-muted-foreground">{marker.danger}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                          <span className="text-muted-foreground">
                            <strong>Type:</strong> {getTypeLabel(marker.type)}
                          </span>
                          <span className="text-muted-foreground font-mono">
                            [{marker.coordinates[0].toFixed(2)}, {marker.coordinates[1].toFixed(2)}]
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {markers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun marker à afficher</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}