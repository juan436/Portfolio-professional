"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useModifiedFieldsForm } from "@/hooks/use-modified-fields-form"

/**
 * Form de la sección About del Admin (3 párrafos).
 * Recibe: `content: AboutContent` + `onChange`.
 * Produce: campos controlados vía `useModifiedFieldsForm` (dedupe de `_modifiedFields`).
 */
export interface AboutContent {
  paragraph1: string
  paragraph2: string
  paragraph3: string
  _modifiedFields?: string[]
}

interface AboutFormProps {
  content: AboutContent
  onChange: (content: AboutContent) => void
}

export default function AboutForm({ content, onChange }: AboutFormProps) {
  const { localContent, handleChange } = useModifiedFieldsForm<AboutContent>(content, onChange)

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
