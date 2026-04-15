'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Hammer, Heart, BookOpen, Search, Skull } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const features = [
    {
      title: 'Cartes Interactives',
      description: 'Explorez Chernarus et Livonia avec markers interactifs',
      icon: MapPin,
      href: '/carte',
      color: 'text-green-500'
    },
    {
      title: 'Système de Crafting',
      description: 'Tous les crafts de DayZ avec ingrédients et utilités',
      icon: Hammer,
      href: '/crafting',
      color: 'text-orange-500'
    },
    {
      title: 'Guide Médical',
      description: 'Maladies, symptômes, traitements et préventions',
      icon: Heart,
      href: '/medical',
      color: 'text-red-500'
    },
    {
      title: 'Guide de Survie',
      description: 'Conseils essentiels pour survivre dans DayZ',
      icon: BookOpen,
      href: '/survie',
      color: 'text-blue-500'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-background via-background/95 to-background py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Skull className="w-20 h-20 text-primary" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-green-400 to-primary bg-clip-text text-transparent">
            DayZ Wiki
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Votre guide de survie complet pour DayZ. Cartes interactives, crafting, soins médicaux et plus encore.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/carte">
              <Button size="lg" className="gap-2">
                <MapPin className="w-5 h-5" />
                Explorer les Cartes
              </Button>
            </Link>
            <Link href="/crafting">
              <Button size="lg" variant="outline" className="gap-2">
                <Search className="w-5 h-5" />
                Rechercher
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Fonctionnalités
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Link key={feature.title} href={feature.href}>
                  <Card className="h-full hover:border-primary transition-all duration-300 cursor-pointer group">
                    <CardHeader>
                      <div className="mb-4">
                        <Icon className={`w-12 h-12 ${feature.color} group-hover:scale-110 transition-transform`} />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">2</div>
              <div className="text-muted-foreground">Cartes</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-500 mb-2">15+</div>
              <div className="text-muted-foreground">Crafts</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-500 mb-2">8</div>
              <div className="text-muted-foreground">Maladies</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-500 mb-2">30+</div>
              <div className="text-muted-foreground">Locations</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>DayZ Wiki - Guide de Survie Communautaire</p>
          <p className="text-sm mt-2">Fait avec ❤️ pour la communauté DayZ</p>
        </div>
      </footer>
    </div>
  )
}