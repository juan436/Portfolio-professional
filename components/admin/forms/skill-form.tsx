"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, X } from "lucide-react"
import type { Skill } from "@/contexts/content/types"
import { renderDevIcon } from "@/lib/devicon-utils"

// Lista de iconos disponibles en Devicon
const availableIcons = [
  // Frontend
  "react",
  "nextjs",
  "typescript",
  "javascript",
  "html5",
  "css3",
  "tailwindcss",
  "bootstrap",
  "sass",
  "vuejs",
  "angular",
  "redux",
  "webpack",
  "babel",
  "jquery",
  "materialui",
  "flutter",
  "svelte",
  
  // Backend
  "nodejs",
  "express",
  "php",
  "laravel",
  "wordpress",
  "woocommerce",
  "python",
  "django",
  "flask",
  "ruby",
  "rails",
  "java",
  "spring",
  "csharp",
  "dotnetcore",
  "go",
  "rust",
  "graphql",
  "nestjs",
  
  // Database
  "mongodb",
  "mysql",
  "postgresql",
  "prisma",
  "sqlite",
  "redis",
  "firebase",
  "supabase",
  "oracle",
  "mariadb",
  "dynamodb",
  "cassandra",
  "neo4j",
  
  // DevOps
  "git",
  "github",
  "gitlab",
  "trello",
  "docker",
  "kubernetes",
  "jenkins",
  "ansible",
  "terraform",
  "amazonwebservices",
  "azure",
  "googlecloud",
  "linux",
  "nginx",
  "vercel",
  "heroku",
  "netlify",
  "ubuntu",
  "jest"
]

interface SkillFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (skill: Skill) => void
  currentSkill: Skill | null
  category: string
}

export default function SkillForm({ isOpen, onClose, onSave, currentSkill, category }: SkillFormProps) {
  const [name, setName] = useState("")
  const [icon, setIcon] = useState("")
  const [useColored, setUseColored] = useState(false)
  const [iconSearchTerm, setIconSearchTerm] = useState("")

  // Filtrar iconos según el término de búsqueda
  const filteredIcons = availableIcons.filter((iconName) =>
    iconName.toLowerCase().includes(iconSearchTerm.toLowerCase())
  )

  // Cargar datos de la habilidad actual si existe
  useEffect(() => {
    if (currentSkill) {
      setName(currentSkill.name || "")
      setIcon(currentSkill.icon || "")
    } else {
      setName("")
      setIcon("")
    }
  }, [currentSkill, isOpen])

  // Renderizar el ícono de Devicon
  const renderIcon = (iconName: string) => {
    return renderDevIcon(iconName, useColored)
  }

  // Manejar el guardado de la habilidad
  const handleSave = () => {
    // Validar que se haya ingresado un nombre y un ícono
    if (!name || !icon) {
      // Mostrar mensaje de error
      return
    }

    // Crear objeto de habilidad con los datos del formulario
    const skillData: Skill = {
      // Solo incluir el _id si existe (es decir, si estamos editando)
      ...(currentSkill?._id ? { _id: currentSkill._id } : {}),
      name,
      icon,
      category,
      colored: useColored
    }

    // Llamar a la función de guardado
    onSave(skillData)

    // Limpiar el formulario y cerrar el diálogo
    setName("")
    setIcon("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-black border-blue-700/20">
        <DialogHeader>
          <DialogTitle>{currentSkill ? "Editar Habilidad" : "Nueva Habilidad"}</DialogTitle>
          <DialogDescription>
            {currentSkill
              ? "Modifica los detalles de la habilidad existente."
              : "Añade una nueva habilidad técnica a tu perfil."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: React, Node.js, PostgreSQL"
              className="bg-black/40 border-blue-700/20"
            />
          </div>

          <div className="grid gap-2">
            <Label>Ícono</Label>
            <div className="relative">
              <div className="flex items-center border rounded-md bg-black/40 border-blue-700/20 px-3 py-2">
                {icon ? (
                  <div className="flex items-center gap-2">
                    {renderIcon(icon)}
                    <span>{icon}</span>
                  </div>
                ) : (
                  <span className="text-slate-400">Seleccionar un ícono</span>
                )}
              </div>
            </div>

            <div className="mt-2">
              <div className="flex items-center gap-2 mb-2">
                <Label className="text-sm flex items-center gap-2">
                  <Switch
                    checked={useColored}
                    onCheckedChange={setUseColored}
                    className="data-[state=checked]:bg-blue-700"
                  />
                  Mostrar iconos a color
                </Label>
                <div className="flex items-center relative ml-auto">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Buscar ícono..."
                    value={iconSearchTerm}
                    onChange={(e) => setIconSearchTerm(e.target.value)}
                    className="pl-8 h-8 bg-black/40 border-blue-700/20 w-[180px]"
                  />
                  {iconSearchTerm && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                      onClick={() => setIconSearchTerm("")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              <ScrollArea className="h-[160px] bg-black/20 border border-blue-700/10 rounded-md p-2">
                <div className="grid grid-cols-4 gap-2">
                  {filteredIcons.length > 0 ? (
                    filteredIcons.map((iconName) => (
                      <Button
                        key={iconName}
                        type="button"
                        variant="ghost"
                        className={`h-16 flex flex-col justify-center items-center p-1 gap-1 ${
                          icon === iconName
                            ? "bg-blue-700/20 border border-blue-700/40"
                            : "hover:bg-blue-900/10"
                        }`}
                        onClick={() => setIcon(iconName)}
                      >
                        {renderIcon(iconName)}
                        <span className="text-xs truncate w-full text-center">{iconName}</span>
                      </Button>
                    ))
                  ) : (
                    <div className="col-span-4 flex items-center justify-center h-[140px] text-slate-400">
                      No se encontraron resultados
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" className="mr-2" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-blue-700 hover:bg-blue-800">
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
