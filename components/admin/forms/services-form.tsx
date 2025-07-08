"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Code, Server, Database, Cpu, Globe, Smartphone, Monitor, Cloud, Shield, LineChart, Settings, Layers, Briefcase, PenTool, FileCode, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ServiceIconSelector from "@/components/admin/common/service-icon-selector"
import { useContent } from "@/contexts/content/use-content"

// Definir la interfaz para un servicio
export interface Service {
  title: string
  description: string
  icon: string
  _id?: string
  _modifiedFields?: string[] // Campo para rastrear campos modificados
}

interface ServicesFormProps {
  services: Service[]
  onChange: (services: Service[]) => void
}

export default function ServicesForm({ services, onChange }: ServicesFormProps) {
  const { toast } = useToast()
  const { deleteService: deleteServiceFromDB } = useContent()
  const [activeServiceIndex, setActiveServiceIndex] = useState(0)

  // Verificar que el índice activo sea válido cuando cambian los servicios
  useEffect(() => {
    if (services.length === 0) {
      setActiveServiceIndex(-1); // No hay servicios seleccionados
    } else if (activeServiceIndex >= services.length) {
      // Si el índice activo es mayor que la longitud del array, seleccionar el último
      setActiveServiceIndex(services.length - 1);
    }
  }, [services, activeServiceIndex]);

  // Agregar nuevo servicio
  const addNewService = () => {
    // Crear un nuevo servicio con valores por defecto
    const newService: Service = {
      title: "Nuevo Servicio",
      description: "Descripción del servicio",
      icon: "Code",
      _modifiedFields: ["title", "description", "icon"] // Marcar todos los campos como modificados
    }
    
    // Añadir el nuevo servicio y actualizar el estado
    const updatedServices = [...services, newService]
    onChange(updatedServices)
    
    // Seleccionar el nuevo servicio
    setActiveServiceIndex(updatedServices.length - 1)
    
    // Mostrar notificación
    toast({
      title: "Servicio añadido",
      description: "Se ha añadido un nuevo servicio. Edita sus detalles.",
    })
  }

  // Eliminar servicio
  const deleteService = async (index: number, e?: React.MouseEvent) => {
    // Evitar la propagación del evento si existe
    if (e) {
      e.stopPropagation()
    }

    const serviceToDelete = services[index];
    
    // Crear una copia del array sin el servicio a eliminar
    const updatedServices = [...services];
    updatedServices.splice(index, 1);
    
    // Ajustar el índice activo si es necesario
    if (updatedServices.length === 0) {
      setActiveServiceIndex(-1);
    } else if (index === activeServiceIndex) {
      // Si eliminamos el servicio activo, seleccionar el anterior o el primero
      const newIndex = index > 0 ? index - 1 : 0;
      setActiveServiceIndex(newIndex);
    } else if (index < activeServiceIndex) {
      // Si eliminamos un servicio antes del activo, ajustar el índice
      const newIndex = activeServiceIndex - 1;
      setActiveServiceIndex(newIndex);
    }

    // Actualizar el estado local primero (para todos los casos)
    onChange(updatedServices);

    // Si el servicio tiene un ID válido (ya existe en la BD), eliminarlo del backend
    if (serviceToDelete._id && serviceToDelete._id.trim() !== '') {
      try {
        const success = await deleteServiceFromDB(serviceToDelete._id);
        
        if (success) {
          toast({
            title: "Servicio eliminado",
            description: "El servicio ha sido eliminado correctamente.",
            variant: "default",
          });
        } else {
          console.error(`[ServicesForm] La función deleteServiceFromDB devolvió false`);
          toast({
            title: "Error al eliminar",
            description: "No se pudo eliminar el servicio del servidor.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("[ServicesForm] Error eliminando servicio:", error);
        toast({
          title: "Error al eliminar",
          description: "Ocurrió un error al eliminar el servicio.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Servicio eliminado",
        description: "El servicio ha sido eliminado localmente.",
        variant: "default",
      });
    }
  }

  // Manejar cambios en el servicio activo
  const handleServiceChange = (field: keyof Service, value: string) => {
    const updatedServices = services.map((service, index) => {
      if (index === activeServiceIndex) {
        // Crear o actualizar el array _modifiedFields
        const currentModifiedFields = service._modifiedFields || [];
        const updatedModifiedFields = currentModifiedFields.includes(field) 
          ? currentModifiedFields 
          : [...currentModifiedFields, field];
        
        return {
          ...service,
          [field]: value,
          _modifiedFields: updatedModifiedFields
        };
      }
      return service;
    });
    onChange(updatedServices)
  }

  // Renderizar el ícono correspondiente
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "Code":
        return <Code className="h-6 w-6 mx-auto text-blue-500" />
      case "Server":
        return <Server className="h-6 w-6 mx-auto text-blue-500" />
      case "Database":
        return <Database className="h-6 w-6 mx-auto text-blue-500" />
      case "Cpu":
        return <Cpu className="h-6 w-6 mx-auto text-blue-500" />
      case "Globe":
        return <Globe className="h-6 w-6 mx-auto text-blue-500" />
      case "Smartphone":
        return <Smartphone className="h-6 w-6 mx-auto text-blue-500" />
      case "Monitor":
        return <Monitor className="h-6 w-6 mx-auto text-blue-500" />
      case "Cloud":
        return <Cloud className="h-6 w-6 mx-auto text-blue-500" />
      case "Shield":
        return <Shield className="h-6 w-6 mx-auto text-blue-500" />
      case "LineChart":
        return <LineChart className="h-6 w-6 mx-auto text-blue-500" />
      case "Settings":
        return <Settings className="h-6 w-6 mx-auto text-blue-500" />
      case "Layers":
        return <Layers className="h-6 w-6 mx-auto text-blue-500" />
      case "Briefcase":
        return <Briefcase className="h-6 w-6 mx-auto text-blue-500" />
      case "PenTool":
        return <PenTool className="h-6 w-6 mx-auto text-blue-500" />
      case "FileCode":
        return <FileCode className="h-6 w-6 mx-auto text-blue-500" />
      case "Zap":
        return <Zap className="h-6 w-6 mx-auto text-blue-500" />
      default:
        return <Code className="h-6 w-6 mx-auto text-blue-500" />
    }
  }

  return (
    <Card className="bg-black/40 border-blue-700/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Sección Servicios</CardTitle>
          <CardDescription>Edita los servicios que ofreces y que se muestran en tu portafolio.</CardDescription>
        </div>
        <Button onClick={addNewService} className="bg-blue-700 hover:bg-blue-800 flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Nuevo Servicio
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {services.map((service, index) => (
            <Card
              key={index}
              className={`cursor-pointer transition-all duration-200 relative ${
                activeServiceIndex === index
                  ? "bg-blue-900/20 border-blue-500"
                  : "bg-black/40 border-blue-700/20 hover:border-blue-700/50"
              }`}
              onClick={() => setActiveServiceIndex(index)}
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="mb-2 mt-2">
                    {renderIcon(service.icon)}
                  </div>
                  <h3 className="font-medium text-sm mb-1">{service.title || "Nuevo Servicio"}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 p-1 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                  onClick={(e) => deleteService(index, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {services.length > 0 ? (
          <div className="space-y-4 border border-blue-700/20 rounded-lg p-4">
            {activeServiceIndex >= 0 && activeServiceIndex < services.length ? (
              <>
                <h3 className="font-medium mb-2">Editando: {services[activeServiceIndex]?.title || "Nuevo Servicio"}</h3>
                <div className="space-y-2">
                  <Label htmlFor="service-icon">Icono</Label>
                  <ServiceIconSelector
                    selectedIcon={services[activeServiceIndex]?.icon || "Code"}
                    onSelectIcon={(icon) => handleServiceChange("icon", icon)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service-title">Título del Servicio</Label>
                  <Input
                    id="service-title"
                    value={services[activeServiceIndex]?.title || ""}
                    onChange={(e) => handleServiceChange("title", e.target.value)}
                    className="bg-black/40 border-blue-700/20"
                    placeholder="Ingresa el título del servicio"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service-description">Descripción</Label>
                  <Textarea
                    id="service-description"
                    value={services[activeServiceIndex]?.description || ""}
                    onChange={(e) => handleServiceChange("description", e.target.value)}
                    className="min-h-[100px] bg-black/40 border-blue-700/20"
                    placeholder="Ingresa la descripción del servicio"
                  />
                </div>
              </>
            ) : (
              <p className="text-gray-400 text-center py-4">Selecciona un servicio para editar</p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 border border-blue-700/20 rounded-lg">
            <Code className="h-12 w-12 text-blue-500/50 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No hay servicios</h3>
            <p className="text-gray-500 text-center max-w-md mb-6">
              Agrega tu primer servicio haciendo clic en el botón "Agregar Servicio"
            </p>
            <Button onClick={addNewService} className="bg-blue-700 hover:bg-blue-800">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Servicio
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
