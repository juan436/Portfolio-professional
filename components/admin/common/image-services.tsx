"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export interface ImageService {
  name: string
  url: string
  description: string
  features: string[]
}

interface ImageServicesProps {
  services: ImageService[]
}

export default function ImageServices({ services }: ImageServicesProps) {
  return (
    <Card className="bg-black/40 border-blue-700/20">
      <CardHeader>
        <CardTitle>Servicios para Imágenes</CardTitle>
        <CardDescription>
          Plataformas recomendadas para almacenar, optimizar y gestionar las imágenes de tu portafolio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <Card key={service.name} className="bg-black/60 border-blue-700/20">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-semibold">{service.name}</h3>
                  <a
                    href={service.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-blue-500 hover:text-blue-400"
                  >
                    Visitar sitio
                  </a>
                </div>
                <p className="text-sm text-slate-300 mb-3">{service.description}</p>
                <div className="mt-2">
                  <h4 className="text-xs font-medium text-slate-400 mb-1">Características:</h4>
                  <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
                    {service.features.map((feature, idx) => (
                      <li key={idx}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
