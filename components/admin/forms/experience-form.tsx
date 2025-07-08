"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Tag, Loader2 } from "lucide-react"
import { useToastNotifications } from "@/hooks/admin/use-toast-notifications"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// Definir la interfaz para una experiencia laboral
export interface Experience {
  _id?: string
  position: string
  company: string
  period: string
  description: string
  skills?: string[]
  companyLogo?: string
  location?: string
  url?: string
  isNew?: boolean
  _modifiedFields?: string[]
}

interface ExperienceFormProps {
  experience: Experience | null
  editMode: boolean
  setEditMode: (value: boolean) => void
  onSave: (experience: Experience) => void
  onCancel?: () => void
  isNewExperience?: boolean
  isLoading?: boolean
}

export default function ExperienceForm({ 
  experience, 
  editMode, 
  setEditMode, 
  onSave, 
  onCancel,
  isNewExperience = false,
  isLoading = false
}: ExperienceFormProps) {
  const toastNotifications = useToastNotifications()
  const [formData, setFormData] = useState<Experience | null>(experience)
  const [newTechnology, setNewTechnology] = useState("")
  const [emptyFields, setEmptyFields] = useState<Record<string, boolean>>({})
  const [modifiedFields, setModifiedFields] = useState<Record<string, boolean>>({})

  // Actualizar el formData cuando cambia la experiencia seleccionada
  useEffect(() => {
    if (isNewExperience && experience) {
      const emptyExperience = { ...experience };
      emptyExperience.position = '';
      emptyExperience.company = '';
      emptyExperience.period = '';
      emptyExperience.description = '';
      emptyExperience.skills = [];
      setFormData(emptyExperience);
    } else {
      setFormData(experience);
    }
    
    // Resetear los campos vacíos y modificados cuando cambia la experiencia
    setEmptyFields({});
    setModifiedFields({});
  }, [experience, isNewExperience]);

  // Manejar cambios en los inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    setEmptyFields(prev => ({
      ...prev,
      [name]: value.trim() === ''
    }))
    
    // Marcar el campo como modificado
    setModifiedFields(prev => ({
      ...prev,
      [name]: true
    }))
    
    setFormData((prev) => prev ? { ...prev, [name]: value } : null)
  }

  // Guardar los cambios
  const handleSave = () => {
    if (formData) {
      const processedData = { 
        ...formData,
        // Asegurar que skills siempre sea un array
        skills: formData.skills || []
      };
      
      // Si estamos editando (no es nueva experiencia), añadir información sobre campos modificados
      if (!isNewExperience) {
        processedData._modifiedFields = Object.keys(modifiedFields).filter(field => modifiedFields[field]);
      }
      
      // Validar datos mínimos
      if (!processedData.position.trim() || !processedData.company.trim() || !processedData.period.trim()) {
        toastNotifications.showErrorToast(
          "Datos incompletos",
          "Debes completar al menos el cargo, la empresa y el período."
        );
        return;
      }
      onSave(processedData);
    }
  }

  // Cancelar la edición
  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      setEditMode(false)
    }
  }

  // Agregar tecnología a la experiencia actual
  const addTechnology = () => {
    if (!newTechnology.trim() || !formData) return;
    const currentSkills = formData.skills || [];
    // Verificar si la tecnología ya existe
    if (currentSkills.includes(newTechnology.trim())) {
      toastNotifications.showErrorToast(
        "Tecnología duplicada",
        "Esta tecnología ya está en la lista."
      )
      return;
    }

    setFormData({
      ...formData,
      skills: [...currentSkills, newTechnology.trim()],
    });
    setNewTechnology("");
  }

  // Eliminar tecnología de la experiencia actual
  const removeTechnology = (tech: string) => {
    if (!formData) return;
    const currentSkills = formData.skills || [];
    setFormData({
      ...formData,
      skills: currentSkills.filter((t) => t !== tech),
    });
  }
  // Si no hay experiencia seleccionada, mostrar mensaje
  if (!formData) {
    return (
      <Card className="bg-black/40 border-blue-700/20">
        <CardHeader>
          <CardTitle>Detalles de la Experiencia</CardTitle>
          <CardDescription>
            Selecciona una experiencia existente o crea una nueva para visualizar detalles
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-center text-slate-400 py-4">No hay experiencia seleccionada</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="bg-black/40 border-blue-700/20">
      <CardHeader>
        <CardTitle>
          {isNewExperience 
            ? "Crear Nueva Experiencia"
            : editMode
              ? "Editar Experiencia"
              : "Detalles de la Experiencia"}
        </CardTitle>
        <CardDescription>
          {isNewExperience
            ? "Ingresa los detalles para crear una nueva experiencia laboral."
            : editMode
              ? "Modifica los detalles de la experiencia seleccionada."
              : "Visualiza los detalles de la experiencia o haz clic en editar."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <LoadingSpinner 
              size="lg" 
              text={isNewExperience ? "Creando experiencia..." : "Guardando cambios..."}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {!editMode && !isNewExperience && (
              <div className="flex justify-end">
                <Button
                  onClick={() => setEditMode(true)}
                  variant="outline"
                  className="border-blue-700/50 text-blue-500 hover:bg-blue-700/10"
                >
                  Editar
                </Button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Cargo</Label>
                <Input
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  placeholder="Ej: Desarrollador Full Stack"
                  className="bg-black/40"
                  disabled={!editMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Ej: Tech Company"
                  className="bg-black/40"
                  disabled={!editMode}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="period">Período</Label>
                <Input
                  id="period"
                  name="period"
                  value={formData.period}
                  onChange={handleInputChange}
                  placeholder="Ej: Enero 2022 - Presente"
                  className="bg-black/40"
                  disabled={!editMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location || ""}
                  onChange={handleInputChange}
                  placeholder="Ej: Remoto / Ciudad, País"
                  className="bg-black/40"
                  disabled={!editMode}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe tus responsabilidades y logros en este puesto..."
                className="bg-black/40 min-h-[100px]"
                disabled={!editMode}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center">
                <Tag className="mr-2 h-4 w-4" />
                Tecnologías utilizadas
              </Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.skills?.map((tech, i) => (
                  <div
                    key={i}
                    className="bg-blue-700/20 text-blue-400 px-2 py-1 rounded-md text-sm flex items-center"
                  >
                    {tech}
                    {editMode && (
                      <button
                        onClick={() => removeTechnology(tech)}
                        className="ml-2 text-blue-400 hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
                {(!formData.skills || formData.skills.length === 0) && (
                  <div className="text-gray-500 text-sm italic">
                    No hay tecnologías añadidas
                  </div>
                )}
              </div>
              {editMode && (
                <div className="flex space-x-2">
                  <Input
                    value={newTechnology}
                    onChange={(e) => setNewTechnology(e.target.value)}
                    placeholder="Añadir tecnología (ej: React, Node.js)"
                    className="bg-black/40"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTechnology()
                      }
                    }}
                  />
                  <Button
                    onClick={addTechnology}
                    className="bg-blue-700 hover:bg-blue-800"
                    type="button"
                  >
                    Añadir
                  </Button>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Estas tecnologías se mostrarán como badges en la sección de experiencia.
              </p>
            </div>

            {editMode && (
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  onClick={handleCancel} 
                  variant="outline"
                  className="border-red-700/50 text-red-500 hover:bg-red-700/10"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="bg-blue-700 hover:bg-blue-800" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isNewExperience ? "Creando..." : "Guardando..."}
                    </>
                  ) : (
                    isNewExperience ? "Crear Experiencia" : "Guardar"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
