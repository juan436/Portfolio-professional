"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useModifiedFieldsForm } from "@/hooks/use-modified-fields-form"

/**
 * Form de la sección Contacto del Admin (email/teléfono/ubicación).
 * Recibe: `content: ContactContent` + `onChange`.
 * Produce: campos controlados vía `useModifiedFieldsForm`.
 */
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
  const { localContent, handleChange } = useModifiedFieldsForm<ContactContent>(content, onChange)

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
