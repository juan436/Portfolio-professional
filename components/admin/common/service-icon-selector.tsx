"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Code, 
  Server, 
  Database, 
  Cpu, 
  Globe, 
  Smartphone, 
  Monitor, 
  Cloud, 
  Shield, 
  LineChart, 
  Settings, 
  Layers, 
  Briefcase,
  PenTool,
  FileCode,
  Zap
} from "lucide-react"

// Lista de iconos disponibles para servicios
const serviceIcons = [
  { value: "Code", label: "Código", icon: <Code className="h-5 w-5" /> },
  { value: "Server", label: "Servidor", icon: <Server className="h-5 w-5" /> },
  { value: "Database", label: "Base de datos", icon: <Database className="h-5 w-5" /> },
  { value: "Cpu", label: "CPU", icon: <Cpu className="h-5 w-5" /> },
  { value: "Globe", label: "Web", icon: <Globe className="h-5 w-5" /> },
  { value: "Smartphone", label: "Móvil", icon: <Smartphone className="h-5 w-5" /> },
  { value: "Monitor", label: "Monitor", icon: <Monitor className="h-5 w-5" /> },
  { value: "Cloud", label: "Nube", icon: <Cloud className="h-5 w-5" /> },
  { value: "Shield", label: "Seguridad", icon: <Shield className="h-5 w-5" /> },
  { value: "LineChart", label: "Análisis", icon: <LineChart className="h-5 w-5" /> },
  { value: "Settings", label: "Configuración", icon: <Settings className="h-5 w-5" /> },
  { value: "Layers", label: "Capas", icon: <Layers className="h-5 w-5" /> },
  { value: "Briefcase", label: "Negocio", icon: <Briefcase className="h-5 w-5" /> },
  { value: "PenTool", label: "Diseño", icon: <PenTool className="h-5 w-5" /> },
  { value: "FileCode", label: "Archivo", icon: <FileCode className="h-5 w-5" /> },
  { value: "Zap", label: "Rendimiento", icon: <Zap className="h-5 w-5" /> },
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
    switch (iconName) {
      case "Code":
        return <Code className="h-5 w-5 text-blue-500" />
      case "Server":
        return <Server className="h-5 w-5 text-blue-500" />
      case "Database":
        return <Database className="h-5 w-5 text-blue-500" />
      case "Cpu":
        return <Cpu className="h-5 w-5 text-blue-500" />
      case "Globe":
        return <Globe className="h-5 w-5 text-blue-500" />
      case "Smartphone":
        return <Smartphone className="h-5 w-5 text-blue-500" />
      case "Monitor":
        return <Monitor className="h-5 w-5 text-blue-500" />
      case "Cloud":
        return <Cloud className="h-5 w-5 text-blue-500" />
      case "Shield":
        return <Shield className="h-5 w-5 text-blue-500" />
      case "LineChart":
        return <LineChart className="h-5 w-5 text-blue-500" />
      case "Settings":
        return <Settings className="h-5 w-5 text-blue-500" />
      case "Layers":
        return <Layers className="h-5 w-5 text-blue-500" />
      case "Briefcase":
        return <Briefcase className="h-5 w-5 text-blue-500" />
      case "PenTool":
        return <PenTool className="h-5 w-5 text-blue-500" />
      case "FileCode":
        return <FileCode className="h-5 w-5 text-blue-500" />
      case "Zap":
        return <Zap className="h-5 w-5 text-blue-500" />
      default:
        return <Code className="h-5 w-5 text-blue-500" />
    }
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
            {serviceIcons.map((icon) => (
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
                {icon.icon}
                <span>{icon.label}</span>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
