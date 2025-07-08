"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useExperienceActions } from "@/hooks/admin/entities/experience/use-experience-actions"
import ExperienceTable from "@/components/admin/tables/experience-table"
import ExperienceForm from "@/components/admin/forms/experience-form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ConfirmationDialog } from "@/components/admin/common/confirmation-dialog"

export default function ExperienceManager() {
  // Usar el hook específico para experiencias que contiene toda la lógica
  const {
    experienceContent,
    selectedExperience,
    editMode,
    isCreatingNewExperience,
    isDeleteDialogOpen,
    isLoading,
    setSelectedExperience,
    setEditMode,
    addNewExperience,
    handleSaveEdit,
    handleCancelEdit,
    deleteExperience,
    handleConfirmDelete,
    handleCloseDeleteDialog
  } = useExperienceActions();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold">Gestión de Experiencia</h2>

      <Card className="bg-black/40 border-blue-700/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Experiencia Laboral</CardTitle>
            <CardDescription>
              Administra tu historial de experiencia laboral. Puedes agregar, editar o eliminar experiencias.
            </CardDescription>
          </div>
          <Button 
            onClick={addNewExperience} 
            className="bg-blue-700 hover:bg-blue-800"
            disabled={isCreatingNewExperience}
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Experiencia
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <ExperienceTable
                experiences={experienceContent.filter(exp => exp._id)} 
                selectedExperience={selectedExperience}
                onSelectExperience={setSelectedExperience}
                onDeleteExperience={(id) => deleteExperience(id)}
                title="Experiencias"
                description="Selecciona una experiencia para ver detalles"
              />
            </div>
            <div className="md:col-span-3">
              {selectedExperience && selectedExperience._id ? (
                <ExperienceForm
                  experience={selectedExperience}
                  editMode={editMode}
                  setEditMode={setEditMode}
                  onSave={handleSaveEdit}
                  onCancel={handleCancelEdit}
                  isNewExperience={isCreatingNewExperience}
                  isLoading={isLoading}
                />
              ) : isCreatingNewExperience ? (
                <ExperienceForm
                  experience={{
                    position: "",
                    company: "",
                    period: "",
                    description: "",
                    skills: []
                  }}
                  editMode={true}
                  setEditMode={setEditMode}
                  onSave={handleSaveEdit}
                  onCancel={handleCancelEdit}
                  isNewExperience={true}
                  isLoading={isLoading}
                />
              ) : (
                <div className="bg-black/20 border border-blue-700/10 rounded-md p-8 flex flex-col items-center justify-center h-full">
                  <p className="text-gray-400 mb-4 text-center">
                    Selecciona una experiencia para ver detalles o crea una nueva
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Eliminar Experiencia"
        description="¿Estás seguro de que deseas eliminar esta experiencia?"
      />
    </motion.div>
  )
}
