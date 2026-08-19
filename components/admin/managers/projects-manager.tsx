"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, Code2, Smartphone, Server } from "lucide-react"
import { useProjectsActions } from "@/hooks/admin/entities/projects/use-projects-actions"

import ProjectForm from "@/components/admin/forms/project-form"
import ProjectsTable from "@/components/admin/tables/projects-table"
import { ConfirmationDialog } from "@/components/admin/common/confirmation-dialog"

export default function ProjectsManager() {
  // Usar el hook específico para proyectos que contiene toda la lógica
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

  // Renderizar el contenido de proyectos según la categoría
  const renderProjectContent = (category: string, title: string, description: string) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1">
        <ProjectsTable
          projects={currentProjects}
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
          onDeleteProject={() => {}} // Mantenemos este prop por compatibilidad
          handleOpenDeleteDialog={handleOpenDeleteDialog}
          title={title}
          description={description}
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
          category={activeCategory as 'web' | 'mobile' | 'infra_backend'}
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
        <TabsList className="bg-black/40 border border-blue-700/20 mb-6">
          <TabsTrigger
            value="web"
            className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500 flex items-center"
          >
            <Code2 className="mr-2 h-4 w-4" />
            Web
          </TabsTrigger>
          <TabsTrigger
            value="mobile"
            className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500 flex items-center"
          >
            <Smartphone className="mr-2 h-4 w-4" />
            Mobile
          </TabsTrigger>
          <TabsTrigger
            value="infra_backend"
            className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500 flex items-center"
          >
            <Server className="mr-2 h-4 w-4" />
            Backend
          </TabsTrigger>
        </TabsList>

        <TabsContent value="web" className="mt-0">
          {renderProjectContent("web", "Proyectos Web", "Selecciona un proyecto para editarlo o añade uno nuevo.")}
        </TabsContent>

        <TabsContent value="mobile" className="mt-0">
          {renderProjectContent("mobile", "Proyectos Mobile", "Selecciona un proyecto para editarlo o añade uno nuevo.")}
        </TabsContent>

        <TabsContent value="infra_backend" className="mt-0">
          {renderProjectContent("infra_backend", "Proyectos Backend", "APIs, servicios y aplicaciones de servidor.")}
        </TabsContent>
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
