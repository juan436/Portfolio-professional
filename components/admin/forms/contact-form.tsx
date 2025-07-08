"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Definir la interfaz para la estructura de datos de contacto
export interface ContactContent {
  email: string
  phone: string
  location: string
  _modifiedFields?: string[]
}

interface ContactFormProps {
  content: ContactContent
  onChange: (content: ContactContent) => void
}

export default function ContactForm({ content, onChange }: ContactFormProps) {
  // Estado para rastrear los campos modificados
  const [modifiedFields, setModifiedFields] = useState<string[]>([]);
  
  // Estado local para el contenido
  const [localContent, setLocalContent] = useState<ContactContent>({...content});
  
  // Actualizar el estado local cuando cambia el contenido desde props
  useEffect(() => {
    setLocalContent({...content});
    // Resetear los campos modificados cuando se recibe nuevo contenido desde props
    setModifiedFields([]);
  }, [content]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        <CardTitle>Información de Contacto</CardTitle>
        <CardDescription>
          Edita tu información de contacto y redes sociales.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            value={localContent.email}
            onChange={handleChange}
            className="bg-black/40 border-blue-700/20"
            placeholder="tu@email.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            name="phone"
            value={localContent.phone}
            onChange={handleChange}
            className="bg-black/40 border-blue-700/20"
            placeholder="+34 123 456 789"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Ubicación</Label>
          <Input
            id="location"
            name="location"
            value={localContent.location}
            onChange={handleChange}
            className="bg-black/40 border-blue-700/20"
            placeholder="Madrid, España"
          />
        </div>
      </CardContent>
    </Card>
  )
}
