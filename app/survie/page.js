'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Lightbulb } from 'lucide-react'

export default function SurviePage() {
  const [guide, setGuide] = useState([])

  useEffect(() => {
    fetch('/data/survival-guide.json')
      .then(res => res.json())
      .then(data => setGuide(data))
      .catch(err => console.error('Erreur chargement guide:', err))
  }, [])

  const categories = [...new Set(guide.map(g => g.category))]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
          <BookOpen className="w-10 h-10 text-primary" />
          Guide de Survie DayZ
        </h1>
        <p className="text-muted-foreground text-lg">
          Conseils essentiels pour survivre dans l'apocalypse
        </p>
      </div>

      {/* Navigation par catégorie */}
      <Tabs defaultValue={categories[0]} className="mb-6">
        <TabsList className="flex-wrap h-auto mb-6">
          {categories.map(cat => (
            <TabsTrigger key={cat} value={cat}>
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(category => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {guide
                .filter(item => item.category === category)
                .map(item => (
                  <Card key={item.id} className="hover:border-primary transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="text-4xl">{item.icon}</div>
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{item.title}</CardTitle>
                          <CardDescription className="text-primary font-semibold">
                            {item.category}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {item.tips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}