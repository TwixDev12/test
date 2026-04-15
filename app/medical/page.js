'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Heart, AlertTriangle, Shield, Pill } from 'lucide-react'

export default function MedicalPage() {
  const [diseases, setDiseases] = useState([])

  useEffect(() => {
    fetch('/data/diseases.json')
      .then(res => res.json())
      .then(data => setDiseases(data))
      .catch(err => console.error('Erreur chargement diseases:', err))
  }, [])

  const severityColors = {
    'low': 'bg-green-500',
    'medium': 'bg-yellow-500',
    'high': 'bg-orange-500',
    'critical': 'bg-red-500'
  }

  const severityLabels = {
    'low': 'Faible',
    'medium': 'Moyen',
    'high': 'Élevé',
    'critical': 'Critique'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
          <Heart className="w-10 h-10 text-primary" />
          Guide Médical DayZ
        </h1>
        <p className="text-muted-foreground text-lg">
          Maladies, infections, symptômes et traitements complets
        </p>
      </div>

      {/* Info Card */}
      <Card className="mb-8 border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Important
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Les maladies dans DayZ peuvent être mortelles si elles ne sont pas traitées rapidement. 
            Gardez toujours des antibiotiques (Tetracycline) et des charcoal tablets dans votre inventaire.
          </p>
        </CardContent>
      </Card>

      {/* Liste des maladies */}
      <div className="space-y-6">
        {diseases.map(disease => (
          <Card key={disease.id} className="overflow-hidden">
            <CardHeader className="bg-card/50">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{disease.name}</CardTitle>
                  <Badge className={`${severityColors[disease.severity]} text-white`}>
                    Gravité: {severityLabels[disease.severity]}
                  </Badge>
                </div>
                <Heart className="w-8 h-8 text-red-500" />
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {/* Symptômes */}
                <AccordionItem value="symptoms">
                  <AccordionTrigger className="text-lg font-semibold">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      Symptômes
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 mt-2">
                      {disease.symptoms.map((symptom, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5" />
                          <span>{symptom}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                {/* Causes */}
                <AccordionItem value="causes">
                  <AccordionTrigger className="text-lg font-semibold">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      Causes
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 mt-2">
                      {disease.causes.map((cause, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5" />
                          <span>{cause}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                {/* Traitement */}
                <AccordionItem value="treatment">
                  <AccordionTrigger className="text-lg font-semibold">
                    <span className="flex items-center gap-2">
                      <Pill className="w-5 h-5 text-green-500" />
                      Traitement
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 mt-2">
                      {disease.treatment.map((treat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                          <span>{treat}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                {/* Prévention */}
                <AccordionItem value="prevention">
                  <AccordionTrigger className="text-lg font-semibold">
                    <span className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-500" />
                      Prévention
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 mt-2">
                      {disease.prevention.map((prev, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                          <span>{prev}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}