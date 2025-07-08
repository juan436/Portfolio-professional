"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageIcon, Check } from "lucide-react"

export interface ImageType {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  path: string
  recommendations: {
    dimensions: string
    format: string
    fileSize: string
    examples: string[]
  }
}

interface ImageGuideProps {
  imageType: ImageType
}

export default function ImageGuide({ imageType }: ImageGuideProps) {
  return (
    <Card className="bg-black/40 border-blue-700/20">
      <CardHeader>
        <CardTitle className="flex items-center">
          {imageType.icon}
          <span className="ml-2">{imageType.name}</span>
        </CardTitle>
        <CardDescription>{imageType.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recomendaciones específicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Recomendaciones</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start">
                <Check className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                <span>Dimensiones: {imageType.recommendations.dimensions}</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                <span>Formato: {imageType.recommendations.format}</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                <span>Tamaño de archivo: {imageType.recommendations.fileSize}</span>
              </li>
              <li className="flex items-start">
                <Check className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                <span>
                  Ubicación recomendada: <code>{imageType.path}</code>
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Ejemplos de nombres de archivo</h3>
            <div className="bg-black/60 p-3 rounded-md text-xs font-mono text-slate-300">
              {imageType.recommendations.examples.map((example, index) => (
                <p key={index}>{example}</p>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
