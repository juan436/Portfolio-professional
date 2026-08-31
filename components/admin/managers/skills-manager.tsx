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

/**
 * Manager de Habilidades del Admin — skills técnicas por categoría (tabs) + "otras habilidades" (lista libre).
 * Recibe: nada (`useSkillsActions`/`useOtherSkillsActions` traen sus propios datos).
 * Produce: CRUD de ambos tipos de skill, con sus propios diálogos de confirmación/edición.
 */
export default function SkillsManager() {
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

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteOtherSkillDialogOpen, setIsDeleteOtherSkillDialogOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null);
  const [otherSkillToDelete, setOtherSkillToDelete] = useState<any>(null);

  const renderIconWithStyle = (iconName: string, colored = true) => {
    return renderDevIcon(iconName, colored, "text-2xl")
  }

  const handleCreateSkill = () => {
    openNewSkillForm(activeTab);
  }

  const handleEditSkill = (skill: Skill) => {
    openEditSkillForm(skill);
  }

  const handleDeleteSkillConfirm = (skill: Skill) => {
    setSkillToDelete(skill);
    setIsDeleteDialogOpen(true);
  }

  const handleDeleteSkill = async () => {
    if (skillToDelete && skillToDelete._id) {
      deleteSkill(skillToDelete._id);
      setIsDeleteDialogOpen(false);
      setSkillToDelete(null);
    }
  }

  const handleCreateOtherSkill = () => {
    openNewOtherSkillDialog();
  }

  const handleEditOtherSkill = (skill: any) => {
    openEditOtherSkillDialog(skill);
  }

  const handleDeleteOtherSkillConfirm = (skill: any) => {
    setOtherSkillToDelete(skill);
    setIsDeleteOtherSkillDialogOpen(true);
  }

  const handleDeleteOtherSkill = async () => {
    if (otherSkillToDelete && otherSkillToDelete._id) {
      deleteOtherSkill(otherSkillToDelete._id);
      setIsDeleteOtherSkillDialogOpen(false);
      setOtherSkillToDelete(null);
    }
  }

  return (
    <>
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

      <SkillForm
        isOpen={isSkillFormOpen}
        onClose={closeSkillForm}
        onSave={saveSkill}
        currentSkill={currentSkill}
        category={activeTab}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteSkill}
        title="Confirmar eliminación"
        description={`¿Estás seguro de que deseas eliminar la habilidad ${skillToDelete?.name}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
      />

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
