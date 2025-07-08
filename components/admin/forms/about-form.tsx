"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Definir la interfaz para la estructura de datos de About
export interface AboutContent {
  paragraph1: string
  paragraph2: string
  paragraph3: string
  _modifiedFields?: string[] // Campo para rastrear campos modificados
}

interface AboutFormProps {
  content: AboutContent
  onChange: (content: AboutContent) => void
}

export default function AboutForm({ content, onChange }: AboutFormProps) {
  // Estado para rastrear los campos modificados
  const [modifiedFields, setModifiedFields] = useState<string[]>([]);
  
  // Estado local para el contenido
  const [localContent, setLocalContent] = useState<AboutContent>({...content});
  
  // Actualizar el estado local cuando cambia el contenido desde props
  useEffect(() => {
    setLocalContent({...content});
    // Resetear los campos modificados cuando se recibe nuevo contenido desde props
    setModifiedFields([]);
  }, [content]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Actualizar el estado local
    setLocalContent(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Registrar el campo como modificado si no está ya en la lista
    if (!modifiedFields.includes(name)) {
      setModifiedFields(prev => [...prev, name]);
    }
    
    // Enviar el contenido actualizado con la lista de campos modificados
    onChange({
      ...localContent,
      [name]: value,
      _modifiedFields: [...modifiedFields, name].filter((v, i, a) => a.indexOf(v) === i) // Eliminar duplicados
    });
  }

  return (
    <Card className="bg-black/40 border-blue-700/20">
      <CardHeader>
        <CardTitle>Sección Sobre Mí</CardTitle>
        <CardDescription>
          Edita la información personal y profesional que aparece en la sección "Sobre Mí".
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="paragraph1">Párrafo 1</Label>
          <Textarea
            id="paragraph1"
            name="paragraph1"
            value={localContent.paragraph1}
            onChange={handleChange}
            className="min-h-[100px] bg-black/40 border-blue-700/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="paragraph2">Párrafo 2</Label>
          <Textarea
            id="paragraph2"
            name="paragraph2"
            value={localContent.paragraph2}
            onChange={handleChange}
            className="min-h-[100px] bg-black/40 border-blue-700/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="paragraph3">Párrafo 3</Label>
          <Textarea
            id="paragraph3"
            name="paragraph3"
            value={localContent.paragraph3}
            onChange={handleChange}
            className="min-h-[100px] bg-black/40 border-blue-700/20"
          />
        </div>
      </CardContent>
    </Card>
  )
}
