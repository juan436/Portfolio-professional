"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Briefcase } from "lucide-react"
import type { Experience } from "@/components/admin/forms/experience-form"

interface ExperienceTableProps {
  experiences: Experience[]
  selectedExperience: Experience | null
  onSelectExperience: (experience: Experience) => void
  onDeleteExperience: (id: string) => void
  title: string
  description: string
}

// Función para truncar texto si excede cierta longitud
const truncateText = (text: string, maxLength: number) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export default function ExperienceTable({
  experiences,
  selectedExperience,
  onSelectExperience,
  onDeleteExperience,
  title,
  description
}: ExperienceTableProps) {
  // Ordenar experiencias (más recientes primero)
  const sortedExperiences = [...experiences].sort((a, b) => {
    // Si hay experiencias nuevas (isNew), ponerlas al principio
    if (a.isNew && !b.isNew) return -1;
    if (!a.isNew && b.isNew) return 1;
    
    // Ordenar por período (asumiendo formato "YYYY - YYYY" o "YYYY - Presente")
    const aYear = a.period?.split(' - ')[0]?.trim() || '';
    const bYear = b.period?.split(' - ')[0]?.trim() || '';
    
    return bYear.localeCompare(aYear); // Orden descendente
  });

  return (
    <Card className="bg-black/40 border-blue-700/20">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
          {sortedExperiences.length > 0 && sortedExperiences.some(exp => exp._id) ? (
            // Solo mostrar experiencias que tengan un _id (que ya están guardadas en la base de datos)
            sortedExperiences
              .filter(experience => experience._id) // Filtrar solo experiencias con _id
              .map((experience, index) => (
              <motion.div
                key={experience._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`p-3 rounded-md cursor-pointer relative group ${
                  selectedExperience && 
                  (selectedExperience._id === experience._id)
                    ? "bg-blue-900/30 border border-blue-500"
                    : "bg-black/20 border border-blue-700/20 hover:border-blue-700/50"
                }`}
                onClick={() => onSelectExperience(experience)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-white">
                      {experience.position 
                        ? truncateText(experience.position, 20)
                        : <span className="italic text-gray-400">Sin cargo</span>}
                    </h3>
                    <p className="text-sm text-gray-300">
                      {experience.company 
                        ? truncateText(experience.company, 20)
                        : <span className="italic text-gray-400">Sin empresa</span>}
                    </p>
                    <p className="text-xs text-gray-400">
                      {experience.period || <span className="italic">Sin período</span>}
                    </p>
                  </div>
                  {experience._id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Asegurarse de que experience._id existe antes de llamar a la función
                        if (experience._id && typeof onDeleteExperience === 'function') {
                          onDeleteExperience(experience._id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Briefcase className="h-10 w-10 text-blue-500/50 mb-3" />
              <p className="text-gray-400 text-center">No hay experiencias</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
