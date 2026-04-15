'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { MapPin, X } from 'lucide-react'

// Import dynamique de la carte pour éviter les erreurs SSR
const InteractiveMap = dynamic(
  () => import('@/components/map/InteractiveMap').then(mod => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] bg-card flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Chargement de la carte...</p>
        </div>
      </div>
    )
  }
)

export default function CartePage() {
  const [markers, setMarkers] = useState({ chernarus: [], livonia: [] })
  const [selectedMap, setSelectedMap] = useState('chernarus')
  const [filters, setFilters] = useState({
    city: true,
    military: true,
    hospital: true,
    landmark: true
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/map-markers.json')
      .then(res => res.json())
      .then(data => {
        setMarkers(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Erreur chargement markers:', err)
        setLoading(false)
      })
  }, [])

  const toggleFilter = (type) => {
    setFilters(prev => ({ ...prev, [type]: !prev[type] }))
  }

  const filterTypes = [
    { key: 'city', label: 'Villes', color: 'bg-blue-500' },
    { key: 'military', label: 'Militaire', color: 'bg-red-500' },
    { key: 'hospital', label: 'Hôpitaux', color: 'bg-green-500' },
    { key: 'landmark', label: 'Landmarks', color: 'bg-yellow-500' }
  ]

  const filteredMarkers = markers[selectedMap]?.filter(marker => filters[marker.type]) || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
          <MapPin className="w-10 h-10 text-primary" />
          Cartes Interactives DayZ
        </h1>
        <p className="text-muted-foreground text-lg">
          Explorez Chernarus et Livonia avec tous les points d'intérêt
        </p>
      </div>

      {/* Sélecteur de carte */}
      <Tabs value={selectedMap} onValueChange={setSelectedMap} className="mb-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="chernarus">Chernarus</TabsTrigger>
          <TabsTrigger value="livonia">Livonia</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filtres */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filterTypes.map(({ key, label, color }) => (
                <Button
                  key={key}
                  variant={filters[key] ? 'default' : 'outline'}
                  className="w-full justify-between"
                  onClick={() => toggleFilter(key)}
                >
                  <span className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    {label}
                  </span>
                  {filters[key] && <X className="w-4 h-4" />}
                </Button>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-border">
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong>Markers visibles:</strong> {filteredMarkers.length}</p>
                <p><strong>Carte:</strong> {selectedMap === 'chernarus' ? 'Chernarus' : 'Livonia'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Carte */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="w-full h-[600px] flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-primary animate-pulse" />
                </div>
              ) : (
                <InteractiveMap
                  markers={filteredMarkers}
                  mapName={selectedMap}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Légende */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Légende</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filterTypes.map(({ label, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${color}`} />
                <span className="text-sm">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}