'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Hammer, Search, Package } from 'lucide-react'

export default function CraftingPage() {
  const [crafts, setCrafts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetch('/data/crafts.json')
      .then(res => res.json())
      .then(data => setCrafts(data))
      .catch(err => console.error('Erreur chargement crafts:', err))
  }, [])

  const categories = ['all', ...new Set(crafts.map(c => c.category))]

  const filteredCrafts = crafts.filter(craft => {
    const matchesSearch = craft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      craft.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || craft.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categoryColors = {
    'Storage': 'bg-blue-500',
    'Medical': 'bg-red-500',
    'Survival': 'bg-orange-500',
    'Tools': 'bg-green-500',
    'Clothing': 'bg-purple-500',
    'Base Building': 'bg-yellow-500',
    'Weapons': 'bg-red-600',
    'Ammunition': 'bg-orange-600',
    'Farming': 'bg-green-600',
    'Lighting': 'bg-yellow-600'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
          <Hammer className="w-10 h-10 text-primary" />
          Système de Crafting DayZ
        </h1>
        <p className="text-muted-foreground text-lg">
          Tous les crafts disponibles avec ingrédients et utilités
        </p>
      </div>

      {/* Barre de recherche */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Rechercher un craft ou un ingrédient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Filtres par catégorie */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
        <TabsList className="flex-wrap h-auto">
          {categories.map(cat => (
            <TabsTrigger key={cat} value={cat} className="capitalize">
              {cat === 'all' ? 'Tous' : cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Stats */}
      <div className="mb-6">
        <p className="text-muted-foreground">
          <strong>{filteredCrafts.length}</strong> craft(s) trouvé(s)
        </p>
      </div>

      {/* Liste des crafts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCrafts.map(craft => (
          <Card key={craft.id} className="hover:border-primary transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <CardTitle className="text-xl">{craft.name}</CardTitle>
                <Badge className={`${categoryColors[craft.category]} text-white`}>
                  {craft.category}
                </Badge>
              </div>
              <CardDescription>{craft.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Ingrédients */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Ingrédients:
                  </h4>
                  <ul className="space-y-1">
                    {craft.ingredients.map((ing, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Résultat */}
                <div>
                  <h4 className="text-sm font-semibold mb-1">Résultat:</h4>
                  <p className="text-sm text-primary font-medium">{craft.result}</p>
                </div>

                {/* Utilité */}
                <div className="pt-3 border-t border-border">
                  <p className="text-sm text-muted-foreground italic">
                    💡 {craft.utility}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCrafts.length === 0 && (
        <Card className="mt-6">
          <CardContent className="py-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun craft trouvé</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}