"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getServiceIconComponent } from "@/lib/service-icon-map"

// Lista de iconos disponibles para servicios
const serviceIcons = [
  { value: "Code", label: "Código" },
  { value: "Server", label: "Servidor" },
  { value: "Database", label: "Base de datos" },
  { value: "Cpu", label: "CPU" },
  { value: "Globe", label: "Web" },
  { value: "Smartphone", label: "Móvil" },
  { value: "Monitor", label: "Monitor" },
  { value: "Cloud", label: "Nube" },
  { value: "Shield", label: "Seguridad" },
  { value: "LineChart", label: "Análisis" },
  { value: "Settings", label: "Configuración" },
  { value: "Layers", label: "Capas" },
  { value: "Briefcase", label: "Negocio" },
  { value: "PenTool", label: "Diseño" },
  { value: "FileCode", label: "Archivo" },
  { value: "Zap", label: "Rendimiento" },
]

interface ServiceIconSelectorProps {
  selectedIcon: string
  onSelectIcon: (icon: string) => void
}

export default function ServiceIconSelector({
  selectedIcon,
  onSelectIcon,
}: ServiceIconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Renderizar el ícono correspondiente
  const renderIcon = (iconName: string) => {
    const Icon = getServiceIconComponent(iconName)
    return <Icon className="h-5 w-5 text-blue-500" />
  }

  return (
    <div>
      <Label>Ícono</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between bg-black/40 border-blue-700/20 mt-2"
          >
            <div className="flex items-center">
              {selectedIcon && (
                <>
                  <span className="mr-2">{renderIcon(selectedIcon)}</span>
                  <span>
                    {serviceIcons.find((icon) => icon.value === selectedIcon)?.label || selectedIcon}
                  </span>
                </>
              )}
            </div>
            <span className="opacity-50">▼</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-black border-blue-700/20" align="start" sideOffset={4}>
          <div className="grid grid-cols-4 gap-2 p-4">
            {serviceIcons.map((icon) => {
              const Icon = getServiceIconComponent(icon.value)
              return (
                <Button
                  key={icon.value}
                  variant="ghost"
                  className={`flex items-center justify-start gap-2 px-3 py-2 ${
                    selectedIcon === icon.value ? "bg-blue-700/20 text-blue-400" : ""
                  }`}
                  onClick={() => {
                    onSelectIcon(icon.value)
                    setIsOpen(false)
                  }}
                >
                  <Icon className="h-5 w-5" />
                  <span>{icon.label}</span>
                </Button>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
