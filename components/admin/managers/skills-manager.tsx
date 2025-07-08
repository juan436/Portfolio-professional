import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Database, Layers, Plus, Server } from "lucide-react"
import SkillsTable from "@/components/admin/tables/skills-table"
import SkillForm from "@/components/admin/forms/skill-form"
import OtherSkillsTable from "@/components/admin/tables/other-skills-table"
import { ConfirmationDialog } from "@/components/admin/common/confirmation-dialog"
import { FormDialog } from "@/components/admin/common/form-dialog"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import type { Skill } from "@/contexts/content/types"
import { useSkillsActions } from "@/hooks/admin/entities/skills/use-skills-actions"
import { useOtherSkillsActions } from "@/hooks/admin/entities/other-skills/use-other-skills-actions"
import { renderDevIcon } from "@/lib/devicon-utils"
import Script from "next/script"

export default function SkillsManager() {
  // Usar los hooks personalizados
  const {
    skills,
    currentSkill,
    isSkillFormOpen,
    activeTab,
    setActiveTab,
    openNewSkillForm,
    openEditSkillForm,
    closeSkillForm,
    saveSkill,
    deleteSkill
  } = useSkillsActions();

  const {
    otherSkills,
    currentOtherSkill,
    isOtherSkillDialogOpen,
    newOtherSkillName,
    setNewOtherSkillName,
    openNewOtherSkillDialog,
    openEditOtherSkillDialog,
    closeOtherSkillDialog,
    saveOtherSkill,
    deleteOtherSkill,
    isLoading
  } = useOtherSkillsActions();

  // Estado para los diálogos de confirmación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteOtherSkillDialogOpen, setIsDeleteOtherSkillDialogOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null);
  const [otherSkillToDelete, setOtherSkillToDelete] = useState<any>(null);

  // Renderizador de iconos de Devicon usando la utilidad centralizada
  const renderIconWithStyle = (iconName: string, colored = true) => {
    return renderDevIcon(iconName, colored, "text-2xl")
  }

  // Crear una nueva skill técnica
  const handleCreateSkill = () => {
    openNewSkillForm(activeTab);
  }

  // Editar una skill existente
  const handleEditSkill = (skill: Skill) => {
    openEditSkillForm(skill);
  }

  // Confirmar eliminación de una skill
  const handleDeleteSkillConfirm = (skill: Skill) => {
    setSkillToDelete(skill);
    setIsDeleteDialogOpen(true);
  }

  // Eliminar una skill
  const handleDeleteSkill = async () => {
    if (skillToDelete && skillToDelete._id) {
      deleteSkill(skillToDelete._id);
      setIsDeleteDialogOpen(false);
      setSkillToDelete(null);
    }
  }

  // Crear una nueva habilidad adicional
  const handleCreateOtherSkill = () => {
    openNewOtherSkillDialog();
  }

  // Editar una habilidad adicional existente
  const handleEditOtherSkill = (skill: any) => {
    openEditOtherSkillDialog(skill);
  }

  // Confirmar eliminación de una habilidad adicional
  const handleDeleteOtherSkillConfirm = (skill: any) => {
    setOtherSkillToDelete(skill);
    setIsDeleteOtherSkillDialogOpen(true);
  }

  // Eliminar una habilidad adicional
  const handleDeleteOtherSkill = async () => {
    if (otherSkillToDelete && otherSkillToDelete._id) {
      deleteOtherSkill(otherSkillToDelete._id);
      setIsDeleteOtherSkillDialogOpen(false);
      setOtherSkillToDelete(null);
    }
  }

  return (
    <>
      {/* Script para cargar los iconos de Devicon */}
      <Script src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.js" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Gestión de Habilidades</h2>
          <Button onClick={handleCreateSkill} className="bg-blue-700 hover:bg-blue-800">
            <Plus className="mr-2 h-4 w-4" />
            Añadir Habilidad
          </Button>
        </div>

        {/* Tabs para las diferentes categorías de habilidades técnicas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-black/40 border border-blue-700/20">
            <TabsTrigger
              value="frontend"
              className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500 flex items-center"
            >
              <Code className="mr-2 h-4 w-4" />
              Frontend
            </TabsTrigger>
            <TabsTrigger
              value="backend"
              className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500 flex items-center"
            >
              <Server className="mr-2 h-4 w-4" />
              Backend
            </TabsTrigger>
            <TabsTrigger
              value="database"
              className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500 flex items-center"
            >
              <Database className="mr-2 h-4 w-4" />
              Bases de Datos
            </TabsTrigger>
            <TabsTrigger
              value="devops"
              className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500 flex items-center"
            >
              <Layers className="mr-2 h-4 w-4" />
              DevOps
            </TabsTrigger>
          </TabsList>

          {/* Contenido para cada tab */}
          <TabsContent value="frontend" className="mt-0">
            <SkillsTable
              skills={skills.frontend || []}
              onEdit={handleEditSkill}
              onDelete={handleDeleteSkillConfirm}
              renderDevIcon={renderIconWithStyle}
            />
          </TabsContent>
          <TabsContent value="backend" className="mt-0">
            <SkillsTable
              skills={skills.backend || []}
              onEdit={handleEditSkill}
              onDelete={handleDeleteSkillConfirm}
              renderDevIcon={renderIconWithStyle}
            />
          </TabsContent>
          <TabsContent value="database" className="mt-0">
            <SkillsTable
              skills={skills.database || []}
              onEdit={handleEditSkill}
              onDelete={handleDeleteSkillConfirm}
              renderDevIcon={renderIconWithStyle}
            />
          </TabsContent>
          <TabsContent value="devops" className="mt-0">
            <SkillsTable
              skills={skills.devops || []}
              onEdit={handleEditSkill}
              onDelete={handleDeleteSkillConfirm}
              renderDevIcon={renderIconWithStyle}
            />
          </TabsContent>
          <TabsContent value="other" className="mt-0">
            <SkillsTable
              skills={skills.other || []}
              onEdit={handleEditSkill}
              onDelete={handleDeleteSkillConfirm}
              renderDevIcon={renderIconWithStyle}
            />
          </TabsContent>
        </Tabs>

        {/* Sección de otras habilidades */}
        <div className="mt-12 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Otras Habilidades</h2>
            <Button onClick={handleCreateOtherSkill} className="bg-blue-700 hover:bg-blue-800">
              <Plus className="mr-2 h-4 w-4" />
              Añadir Habilidad
            </Button>
          </div>

          <OtherSkillsTable
            skills={otherSkills}
            onEdit={handleEditOtherSkill}
            onDelete={handleDeleteOtherSkillConfirm}
          />
        </div>
      </motion.div>

      {/* Formulario para añadir/editar habilidad técnica */}
      <SkillForm
        isOpen={isSkillFormOpen}
        onClose={closeSkillForm}
        onSave={saveSkill}
        currentSkill={currentSkill}
        category={activeTab}
      />

      {/* Dialog para confirmar eliminación de habilidad técnica */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteSkill}
        title="Confirmar eliminación"
        description={`¿Estás seguro de que deseas eliminar la habilidad ${skillToDelete?.name}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
      />

      {/* Dialog para añadir/editar otra habilidad */}
      <FormDialog
        isOpen={isOtherSkillDialogOpen}
        onClose={closeOtherSkillDialog}
        onSubmit={saveOtherSkill}
        title={currentOtherSkill ? "Editar Habilidad" : "Nueva Habilidad"}
        description={currentOtherSkill
          ? "Actualiza el nombre de la habilidad adicional."
          : "Añade una nueva habilidad adicional a tu perfil."}
        isLoading={isLoading}
        submitLabel={isLoading ? "Guardando..." : "Guardar"}
      >
        <div className="grid gap-2">
          <Input
            value={newOtherSkillName}
            onChange={(e) => setNewOtherSkillName(e.target.value)}
            placeholder="Ej: Gestión de equipos, Comunicación efectiva"
            className="bg-black/40 border-blue-700/20"
            disabled={isLoading}
          />
        </div>
      </FormDialog>

      {/* Dialog para confirmar eliminación de otra habilidad */}
      <ConfirmationDialog
        isOpen={isDeleteOtherSkillDialogOpen}
        onClose={() => setIsDeleteOtherSkillDialogOpen(false)}
        onConfirm={handleDeleteOtherSkill}
        title="Confirmar eliminación"
        description={`¿Estás seguro de que deseas eliminar la habilidad "${otherSkillToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
      />
    </>
  )
}
