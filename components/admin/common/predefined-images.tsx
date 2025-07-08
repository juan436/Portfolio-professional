"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export interface PredefinedImage {
  url: string
  description: string
}

interface PredefinedImagesProps {
  images: PredefinedImage[]
}

export default function PredefinedImages({ images }: PredefinedImagesProps) {
  const { toast } = useToast()
  const [copiedUrl, setCopiedUrl] = useState("")

  // Función para copiar al portapapeles
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url).then(
      () => {
        setCopiedUrl(url)
        toast({
          title: "URL copiada",
          description: "La URL de la imagen ha sido copiada al portapapeles.",
          variant: "default",
        })

        // Resetear el estado después de 2 segundos
        setTimeout(() => {
          setCopiedUrl("")
        }, 2000)
      },
      (err) => {
        console.error("Error al copiar: ", err)
        toast({
          title: "Error al copiar",
          description: "No se pudo copiar la URL al portapapeles.",
          variant: "destructive",
        })
      },
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <Card key={index} className="bg-black/60 border-blue-700/20 overflow-hidden">
          <div className="relative h-40">
            <img
              src={image.url || "/placeholder.svg"}
              alt={image.description}
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="p-3">
            <p className="text-sm text-slate-300 mb-2 line-clamp-1">{image.description}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-400 truncate flex-1">{image.url}</p>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 text-slate-400 hover:text-blue-500"
                onClick={() => copyToClipboard(image.url)}
              >
                {copiedUrl === image.url ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
