"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, Code2, Smartphone, Server, FlaskConical, Workflow, Bot } from "lucide-react"
import { useProjectsActions } from "@/hooks/admin/entities/projects/use-projects-actions"
import { CATEGORY_LABELS, CATEGORY_ORDER, type ProjectCategoryValue } from "@/hooks/admin/entities/projects/types"

import ProjectForm from "@/components/admin/forms/project-form"
import ProjectsTable from "@/components/admin/tables/projects-table"
import { ConfirmationDialog } from "@/components/admin/common/confirmation-dialog"

const CATEGORY_ICONS: Record<ProjectCategoryValue, React.ElementType> = {
  web: Code2,
  mobile: Smartphone,
  infra_backend: Server,
  laboratorio: FlaskConical,
  automatizacion: Workflow,
  agente: Bot,
}

const CATEGORY_DESCRIPTIONS: Record<ProjectCategoryValue, string> = {
  web: "Selecciona un proyecto para editarlo o añade uno nuevo.",
  mobile: "Selecciona un proyecto para editarlo o añade uno nuevo.",
  infra_backend: "APIs, servicios y aplicaciones de servidor.",
  laboratorio: "Experimentos y pruebas técnicas (R&D).",
  automatizacion: "Flujos de automatización (n8n, scripts, etc.).",
  agente: "Agentes conversacionales (ej. Jevy).",
}

export default function ProjectsManager() {
  const {
    activeCategory,
    currentProjects,
    selectedProject,
    editMode,
    isCreatingNewProject,
    isDeleteDialogOpen,
    isLoading,
    setActiveCategory,
    setSelectedProject,
    setEditMode,
    addNewProject,
    handleSaveEdit,
    handleCancelEdit,
    handleOpenDeleteDialog,
    handleCloseDeleteDialog,
    handleConfirmDelete
  } = useProjectsActions();

  const renderProjectContent = (category: ProjectCategoryValue) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1">
        <ProjectsTable
          projects={currentProjects}
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
          handleOpenDeleteDialog={handleOpenDeleteDialog}
          title={`Proyectos ${CATEGORY_LABELS[category]}`}
          description={CATEGORY_DESCRIPTIONS[category]}
        />
      </div>
      <div className="md:col-span-3">
        <ProjectForm
          project={selectedProject}
          editMode={editMode}
          setEditMode={setEditMode}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          isNewProject={isCreatingNewProject}
          isLoading={isLoading}
          category={activeCategory}
        />
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestor de Proyectos</h2>
        <Button onClick={addNewProject} className="bg-blue-700 hover:bg-blue-800">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proyecto
        </Button>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="bg-black/40 border border-blue-700/20 mb-6 flex-wrap h-auto">
          {CATEGORY_ORDER.map((category) => {
            const Icon = CATEGORY_ICONS[category]
            return (
              <TabsTrigger
                key={category}
                value={category}
                className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500 flex items-center"
              >
                <Icon className="mr-2 h-4 w-4" />
                {CATEGORY_LABELS[category]}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {CATEGORY_ORDER.map((category) => (
          <TabsContent key={category} value={category} className="mt-0">
            {renderProjectContent(category)}
          </TabsContent>
        ))}
      </Tabs>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Eliminar Proyecto"
        description="¿Estás seguro de que deseas eliminar este proyecto?"
      />
    </motion.div>
  );
}
