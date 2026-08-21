"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageIcon, Loader2 } from "lucide-react"
import { useToastNotifications } from "@/hooks/admin/use-toast-notifications"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { CATEGORY_LABELS, CATEGORY_ORDER, type AdminProject, type ProjectCategoryValue } from "@/hooks/admin/entities/projects/types"
import { StringListField, TextField, TextAreaField, PairListEditor, WorkProcessEditor } from "./project-form-fields"

/**
 * Form de crear/editar/ver un Proyecto (Admin) — cubre las ~25 campos del modelo real,
 * en secciones plegables, con bloques específicos por categoría (lab/automatización/agente/etc.).
 * Recibe: `project`/`editMode`/`setEditMode`/`onSave`/`onCancel?`/`isNewProject?`/`isLoading?`/`category?`.
 * Procesa: `set`/`setTop`/`setNested` actualizan por path y marcan el campo de primer nivel como modificado.
 * Produce: al guardar edición, un patch solo con los campos realmente tocados (no el objeto completo).
 */
interface ProjectFormProps {
  project: AdminProject | null
  editMode: boolean
  setEditMode: (value: boolean) => void
  onSave: (project: AdminProject) => void
  onCancel?: () => void
  isNewProject?: boolean
  isLoading?: boolean
  category?: ProjectCategoryValue
}

// Rediseño 2026-08-19: el form viejo solo editaba título/descripción/imagen/
// tags/github/demo (6 de ~25 campos del modelo real — auditoría del Admin).
// Este cubre todo el schema, organizado en secciones plegables. `set()`
// actualiza por path (soporta anidados tipo "techStack.frontend") y marca el
// campo de primer nivel como modificado, para que el guardado solo mande lo
// que realmente cambió.
export default function ProjectForm({
  project,
  editMode,
  setEditMode,
  onSave,
  onCancel,
  isNewProject = false,
  isLoading = false,
  category = "web",
}: ProjectFormProps) {
  const [formData, setFormData] = useState<AdminProject | null>(project)
  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set())
  const toastNotifications = useToastNotifications()

  useEffect(() => {
    setFormData(project)
    setModifiedFields(new Set())
  }, [project, isNewProject])

  const set = (topLevelField: string, updater: (prev: AdminProject) => AdminProject) => {
    setFormData((prev) => (prev ? updater(prev) : prev))
    setModifiedFields((prev) => new Set(prev).add(topLevelField))
  }

  const setTop = <K extends keyof AdminProject>(field: K, value: AdminProject[K]) => {
    set(field as string, (prev) => ({ ...prev, [field]: value }))
  }

  const setNested = <K extends keyof AdminProject>(field: K, patch: Record<string, any>) => {
    set(field as string, (prev) => ({ ...prev, [field]: { ...(prev[field] as object), ...patch } }))
  }

  const handleSave = () => {
    if (!formData) return
    const processed: any = { ...formData }
    if (!Array.isArray(processed.tags)) processed.tags = []

    if (isNewProject) {
      if (!processed.title) processed.title = "Nuevo proyecto"
      if (!processed.description) processed.description = "Descripción del proyecto"
      if (!processed.github) processed.github = "#"
      if (!processed.demo) processed.demo = "#"
      onSave(processed)
    } else {
      const partial: any = { category: formData.category }
      for (const field of modifiedFields) {
        partial[field] = processed[field]
      }
      partial._id = formData._id
      onSave(partial)
    }
  }

  const handleCancel = () => {
    if (onCancel) onCancel()
    else setEditMode(false)
  }

  if (!formData) {
    return (
      <Card className="bg-black/40 border-blue-700/20">
        <CardHeader>
          <CardTitle>Detalles del Proyecto</CardTitle>
          <CardDescription>Selecciona un proyecto existente o crea uno nuevo para visualizar detalles</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-center text-slate-400 py-4">No hay proyecto seleccionado</p>
        </CardContent>
      </Card>
    )
  }

  const disabled = !editMode
  const cat = formData.category || category

  return (
    <Card className="bg-black/40 border-blue-700/20">
      <CardHeader>
        <CardTitle>
          {isNewProject ? "Crear Nuevo Proyecto" : editMode ? "Editar Proyecto" : "Detalles del Proyecto"}
        </CardTitle>
        <CardDescription>
          {isNewProject
            ? "Completá lo que corresponda — casi todo es opcional."
            : editMode
              ? "Modificá los detalles del proyecto seleccionado."
              : "Visualizá los detalles o hacé clic en editar."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <LoadingSpinner size="lg" text={isNewProject ? "Creando proyecto..." : "Guardando cambios..."} />
          </div>
        ) : (
          <div className="space-y-4">
            {!editMode && !isNewProject && (
              <div className="flex justify-end">
                <Button onClick={() => setEditMode(true)} variant="outline" className="border-blue-700/50 text-blue-500 hover:bg-blue-700/10">
                  Editar
                </Button>
              </div>
            )}

            <Accordion type="multiple" defaultValue={["basico"]} className="space-y-2">
              <AccordionItem value="basico" className="border border-blue-700/20 rounded-md px-3">
                <AccordionTrigger className="text-sm font-medium">Básico</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <TextField label="Título" value={formData.title} onChange={(v) => setTop("title", v)} disabled={disabled} />
                  <TextField label="Slug (URL pública, vacío = se genera del título)" value={formData.slug} onChange={(v) => setTop("slug", v)} disabled={disabled} placeholder="mi-proyecto-nuevo" />
                  <TextAreaField label="Descripción" value={formData.description} onChange={(v) => setTop("description", v)} disabled={disabled} />

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Categoría</label>
                    <Select value={cat} onValueChange={(v) => setTop("category", v as ProjectCategoryValue)} disabled={disabled}>
                      <SelectTrigger className="bg-black/40 border-blue-700/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_ORDER.map((c) => (
                          <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <TextField label="Subtipo" value={formData.subtype} onChange={(v) => setTop("subtype", v)} disabled={disabled} placeholder="ej. E-commerce, Chatbot, CRM..." />

                  <div className="space-y-2">
                    <label className="text-sm font-medium">URL de la Imagen</label>
                    <div className="flex gap-2">
                      <input
                        value={formData.image || ""}
                        onChange={(e) => setTop("image", e.target.value)}
                        disabled={disabled}
                        className="flex h-10 w-full rounded-md border border-blue-700/20 bg-black/40 px-3 py-2 text-sm text-white"
                      />
                      {formData.image && (
                        <Button variant="outline" size="icon" className="border-blue-700/50 text-blue-500" onClick={() => window.open(formData.image, "_blank")}>
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <StringListField label="Galería de imágenes (URLs)" values={formData.images} onChange={(v) => setTop("images", v)} disabled={disabled} placeholder="URL de imagen" />
                  <TextField label="Video (URL)" value={formData.video} onChange={(v) => setTop("video", v)} disabled={disabled} />
                  <StringListField label="Etiquetas" values={formData.tags} onChange={(v) => setTop("tags", v)} disabled={disabled} placeholder="React, Node.js..." />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField label="URL de GitHub" value={formData.github} onChange={(v) => setTop("github", v)} disabled={disabled} />
                    <TextField label="URL de Demo/Docs" value={formData.demo} onChange={(v) => setTop("demo", v)} disabled={disabled} />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="categorizacion" className="border border-blue-700/20 rounded-md px-3">
                <AccordionTrigger className="text-sm font-medium">Categorización para el visitante</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField label="Duración" value={formData.duration} onChange={(v) => setTop("duration", v)} disabled={disabled} placeholder="ej. 3 meses" />
                    <TextField label="Sector / enfocado a" value={formData.sector} onChange={(v) => setTop("sector", v)} disabled={disabled} />
                  </div>
                  <TextField label="Rol en el proyecto" value={formData.role} onChange={(v) => setTop("role", v)} disabled={disabled} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="stack" className="border border-blue-700/20 rounded-md px-3">
                <AccordionTrigger className="text-sm font-medium">Stack técnico</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <StringListField label="Frontend" values={formData.techStack?.frontend} onChange={(v) => setNested("techStack", { frontend: v })} disabled={disabled} />
                  <StringListField label="Backend" values={formData.techStack?.backend} onChange={(v) => setNested("techStack", { backend: v })} disabled={disabled} />
                  <StringListField label="Base de datos" values={formData.techStack?.database} onChange={(v) => setNested("techStack", { database: v })} disabled={disabled} />
                  <StringListField label="Infraestructura" values={formData.techStack?.infra} onChange={(v) => setNested("techStack", { infra: v })} disabled={disabled} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="reto" className="border border-blue-700/20 rounded-md px-3">
                <AccordionTrigger className="text-sm font-medium">Reto y Solución</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <TextAreaField label="El reto" value={formData.challenge?.problem} onChange={(v) => setNested("challenge", { problem: v })} disabled={disabled} />
                  <TextAreaField label="La solución" value={formData.challenge?.solution} onChange={(v) => setNested("challenge", { solution: v })} disabled={disabled} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="proceso" className="border border-blue-700/20 rounded-md px-3">
                <AccordionTrigger className="text-sm font-medium">Cómo trabajé</AccordionTrigger>
                <AccordionContent className="pt-2">
                  <WorkProcessEditor label="Bloques" blocks={formData.workProcess} onChange={(v) => setTop("workProcess", v as any)} disabled={disabled} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="decisiones" className="border border-blue-700/20 rounded-md px-3">
                <AccordionTrigger className="text-sm font-medium">Decisiones técnicas</AccordionTrigger>
                <AccordionContent className="pt-2">
                  <PairListEditor
                    label="Decisiones"
                    rows={formData.technicalDecisions}
                    onChange={(v) => setTop("technicalDecisions", v as any)}
                    disabled={disabled}
                    fieldA="title"
                    fieldB="description"
                    labelA="Título de la decisión"
                    labelB="Descripción"
                    makeEmpty={() => ({ title: "", description: "" })}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="seguridad" className="border border-blue-700/20 rounded-md px-3">
                <AccordionTrigger className="text-sm font-medium">Seguridad</AccordionTrigger>
                <AccordionContent className="pt-2">
                  <StringListField label="Qué protege en producción" values={formData.securityHardening} onChange={(v) => setTop("securityHardening", v)} disabled={disabled} placeholder="ej. Rate limiting en /api/*" />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="despliegue" className="border border-blue-700/20 rounded-md px-3">
                <AccordionTrigger className="text-sm font-medium">Despliegue</AccordionTrigger>
                <AccordionContent className="pt-2">
                  <PairListEditor
                    label="Pasos del diagrama"
                    rows={formData.deploymentDiagram}
                    onChange={(v) => setTop("deploymentDiagram", v as any)}
                    disabled={disabled}
                    fieldA="icon"
                    fieldB="label"
                    labelA="Icono (clave interna)"
                    labelB="Etiqueta visible"
                    makeEmpty={() => ({ icon: "", label: "" })}
                  />
                </AccordionContent>
              </AccordionItem>

              {(cat === "infra_backend") && (
                <AccordionItem value="infra" className="border border-blue-700/20 rounded-md px-3">
                  <AccordionTrigger className="text-sm font-medium">Infraestructura en producción</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <TextField label="Uptime" value={formData.infraDetails?.uptime} onChange={(v) => setNested("infraDetails", { uptime: v })} disabled={disabled} />
                    <TextField label="Capacidad" value={formData.infraDetails?.capacity} onChange={(v) => setNested("infraDetails", { capacity: v })} disabled={disabled} />
                    <StringListField label="Monitoreo" values={formData.infraDetails?.monitoring} onChange={(v) => setNested("infraDetails", { monitoring: v })} disabled={disabled} />
                    <TextField label="Estrategia de backup" value={formData.infraDetails?.backupStrategy} onChange={(v) => setNested("infraDetails", { backupStrategy: v })} disabled={disabled} />
                    <TextField label="Optimización de costo" value={formData.infraDetails?.costOptimized} onChange={(v) => setNested("infraDetails", { costOptimized: v })} disabled={disabled} />
                  </AccordionContent>
                </AccordionItem>
              )}

              {(cat === "web" || cat === "infra_backend") && (
                <AccordionItem value="impacto" className="border border-blue-700/20 rounded-md px-3">
                  <AccordionTrigger className="text-sm font-medium">Impacto en el negocio</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <TextField label="Tiempo ahorrado" value={formData.systemDetails?.timeSaved} onChange={(v) => setNested("systemDetails", { timeSaved: v })} disabled={disabled} />
                    <TextField label="Usuarios gestionados" value={formData.systemDetails?.usersManaged} onChange={(v) => setNested("systemDetails", { usersManaged: v })} disabled={disabled} />
                    <TextField label="Capacidad" value={formData.systemDetails?.capacity} onChange={(v) => setNested("systemDetails", { capacity: v })} disabled={disabled} />
                    <StringListField label="Integraciones" values={formData.systemDetails?.integrations} onChange={(v) => setNested("systemDetails", { integrations: v })} disabled={disabled} />
                    <TextField label="Reportes generados" value={formData.systemDetails?.reportsGenerated} onChange={(v) => setNested("systemDetails", { reportsGenerated: v })} disabled={disabled} />
                  </AccordionContent>
                </AccordionItem>
              )}

              {cat === "web" && (
                <AccordionItem value="ecommerce" className="border border-blue-700/20 rounded-md px-3">
                  <AccordionTrigger className="text-sm font-medium">Comercio electrónico</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <StringListField label="Pasarelas de pago" values={formData.ecommerceDetails?.paymentGateway} onChange={(v) => setNested("ecommerceDetails", { paymentGateway: v })} disabled={disabled} />
                    <TextField label="Flujo de checkout" value={formData.ecommerceDetails?.checkoutFlow} onChange={(v) => setNested("ecommerceDetails", { checkoutFlow: v })} disabled={disabled} />
                    <TextField label="Inventario" value={formData.ecommerceDetails?.inventory} onChange={(v) => setNested("ecommerceDetails", { inventory: v })} disabled={disabled} />
                    <TextField label="Capacidad" value={formData.ecommerceDetails?.capacity} onChange={(v) => setNested("ecommerceDetails", { capacity: v })} disabled={disabled} />
                    <TextField label="Performance / SEO" value={formData.ecommerceDetails?.performanceSeo} onChange={(v) => setNested("ecommerceDetails", { performanceSeo: v })} disabled={disabled} />
                    <StringListField label="Métodos de pago" values={formData.ecommerceDetails?.paymentMethods} onChange={(v) => setNested("ecommerceDetails", { paymentMethods: v })} disabled={disabled} />
                  </AccordionContent>
                </AccordionItem>
              )}

              {cat === "mobile" && (
                <AccordionItem value="mobiledetails" className="border border-blue-700/20 rounded-md px-3">
                  <AccordionTrigger className="text-sm font-medium">Detalles de la app</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <StringListField label="Plataformas" values={formData.mobileDetails?.platforms} onChange={(v) => setNested("mobileDetails", { platforms: v })} disabled={disabled} />
                    <TextField label="Estado en las stores" value={formData.mobileDetails?.storeStatus} onChange={(v) => setNested("mobileDetails", { storeStatus: v })} disabled={disabled} />
                    <TextField label="Soporte offline" value={formData.mobileDetails?.offlineSupport} onChange={(v) => setNested("mobileDetails", { offlineSupport: v })} disabled={disabled} />
                    <TextField label="Notificaciones push" value={formData.mobileDetails?.pushNotifications} onChange={(v) => setNested("mobileDetails", { pushNotifications: v })} disabled={disabled} />
                    <TextField label="Rendimiento de carga" value={formData.mobileDetails?.loadPerformance} onChange={(v) => setNested("mobileDetails", { loadPerformance: v })} disabled={disabled} />
                  </AccordionContent>
                </AccordionItem>
              )}

              {cat === "laboratorio" && (
                <AccordionItem value="lab" className="border border-blue-700/20 rounded-md px-3">
                  <AccordionTrigger className="text-sm font-medium">Laboratorio R&D</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Estado</label>
                      <Select value={formData.labDetails?.status || "testing"} onValueChange={(v) => setNested("labDetails", { status: v })} disabled={disabled}>
                        <SelectTrigger className="bg-black/40 border-blue-700/20"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="testing">En pruebas</SelectItem>
                          <SelectItem value="completed">Completado</SelectItem>
                          <SelectItem value="discontinued">Descontinuado</SelectItem>
                          <SelectItem value="evolved">Evolucionó a proyecto real</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <TextField label="Tiempo invertido" value={formData.labDetails?.timeInvested} onChange={(v) => setNested("labDetails", { timeInvested: v })} disabled={disabled} />
                    <TextAreaField label="Por qué lo exploré" value={formData.labDetails?.motivation} onChange={(v) => setNested("labDetails", { motivation: v })} disabled={disabled} />
                    <TextAreaField label="Comparado con otras opciones" value={formData.labDetails?.comparison} onChange={(v) => setNested("labDetails", { comparison: v })} disabled={disabled} />
                    <StringListField label="Limitaciones conocidas" values={formData.labDetails?.limitations} onChange={(v) => setNested("labDetails", { limitations: v })} disabled={disabled} />
                    <TextAreaField label="Próximo paso" value={formData.labDetails?.nextStep} onChange={(v) => setNested("labDetails", { nextStep: v })} disabled={disabled} />
                  </AccordionContent>
                </AccordionItem>
              )}

              {cat === "automatizacion" && (
                <AccordionItem value="automation" className="border border-blue-700/20 rounded-md px-3">
                  <AccordionTrigger className="text-sm font-medium">Detalles de la automatización</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <TextField label="Icono" value={formData.automationDetails?.icon} onChange={(v) => setNested("automationDetails", { icon: v })} disabled={disabled} />
                    <TextAreaField label="Caso de uso" value={formData.automationDetails?.useCase} onChange={(v) => setNested("automationDetails", { useCase: v })} disabled={disabled} />
                    <StringListField label="Construido con" values={formData.automationDetails?.tools} onChange={(v) => setNested("automationDetails", { tools: v })} disabled={disabled} />
                    <StringListField label="Canales soportados" values={formData.automationDetails?.channels} onChange={(v) => setNested("automationDetails", { channels: v })} disabled={disabled} />
                    <TextField label="Tiempo de puesta en marcha" value={formData.automationDetails?.setupTime} onChange={(v) => setNested("automationDetails", { setupTime: v })} disabled={disabled} />
                    <StringListField label="Pasos de la demo" values={formData.automationDetails?.flow?.steps} onChange={(v) => setNested("automationDetails", { flow: { ...formData.automationDetails?.flow, steps: v } })} disabled={disabled} />
                    <TextField label="Placeholder de la demo" value={formData.automationDetails?.flow?.demoPlaceholder} onChange={(v) => setNested("automationDetails", { flow: { ...formData.automationDetails?.flow, demoPlaceholder: v } })} disabled={disabled} />
                    <TextField label="Plantilla de salida (usa {input})" value={formData.automationDetails?.flow?.demoOutputTemplate} onChange={(v) => setNested("automationDetails", { flow: { ...formData.automationDetails?.flow, demoOutputTemplate: v } })} disabled={disabled} />
                  </AccordionContent>
                </AccordionItem>
              )}

              {cat === "agente" && (
                <AccordionItem value="agent" className="border border-blue-700/20 rounded-md px-3">
                  <AccordionTrigger className="text-sm font-medium">Detalles del agente</AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <TextField label="Icono" value={formData.agentDetails?.icon} onChange={(v) => setNested("agentDetails", { icon: v })} disabled={disabled} />
                    <TextAreaField label="Caso de uso" value={formData.agentDetails?.useCase} onChange={(v) => setNested("agentDetails", { useCase: v })} disabled={disabled} />
                    <StringListField label="Capacidades" values={formData.agentDetails?.capabilities} onChange={(v) => setNested("agentDetails", { capabilities: v })} disabled={disabled} />
                    <StringListField label="Canales soportados" values={formData.agentDetails?.channels} onChange={(v) => setNested("agentDetails", { channels: v })} disabled={disabled} />
                    <StringListField label="Construido con" values={formData.agentDetails?.tools} onChange={(v) => setNested("agentDetails", { tools: v })} disabled={disabled} />
                    <TextField label="Tiempo de puesta en marcha" value={formData.agentDetails?.setupTime} onChange={(v) => setNested("agentDetails", { setupTime: v })} disabled={disabled} />
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Demo en vivo</label>
                      <Select value={formData.agentDetails?.liveDemo || "none"} onValueChange={(v) => setNested("agentDetails", { liveDemo: v })} disabled={disabled}>
                        <SelectTrigger className="bg-black/40 border-blue-700/20"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Ninguna</SelectItem>
                          <SelectItem value="jevy-chat">Chat de Jevy</SelectItem>
                          <SelectItem value="synapse-chat">Chat de Synapse</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              <AccordionItem value="jevy" className="border border-blue-700/20 rounded-md px-3">
                <AccordionTrigger className="text-sm font-medium">Perfil de matching (Jevy)</AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <p className="text-xs text-slate-500">Nunca se muestra al visitante — lo usa el motor de matching determinístico de Jevy (<code>lib/matching.ts</code>) para decidir si este proyecto es un buen candidato ante un lead. Visible para las 6 categorías: <code>Project.find({"{}"})</code> en <code>app/api/contact/chat/route.ts</code> no filtra por categoría — cualquier proyecto es candidato. Los 4 ejes de abajo se comparan contra el perfil extraído del lead; <strong>pitchCorto es lo único que Jevy realmente cita/parafrasea al presentar el match</strong>.</p>
                  <TextField label="Categoría (Jevy)" value={formData.jevyProfile?.categoria} onChange={(v) => setNested("jevyProfile", { categoria: v })} disabled={disabled} placeholder="web | mobile | infra_backend | automatizacion | laboratorio | no_definido" />
                    <TextField label="Subtipo (Jevy)" value={formData.jevyProfile?.subtype} onChange={(v) => setNested("jevyProfile", { subtype: v })} disabled={disabled} placeholder="ej. crm, marketplace, bot_conversacional..." />
                    <TextField label="Problema core (Jevy)" value={formData.jevyProfile?.problemaCore} onChange={(v) => setNested("jevyProfile", { problemaCore: v })} disabled={disabled} placeholder="ej. atencion_cliente_multicanal — condición obligatoria del match, no solo suma puntos" />
                    <TextField label="Sector (Jevy)" value={formData.jevyProfile?.sector} onChange={(v) => setNested("jevyProfile", { sector: v })} disabled={disabled} placeholder="snake_case, ej. ride_sharing" />
                    <TextAreaField label="Pitch corto — el resumen real para Jevy" value={formData.jevyProfile?.pitchCorto} onChange={(v) => setNested("jevyProfile", { pitchCorto: v })} disabled={disabled} placeholder="Lo que Jevy cita al presentar este proyecto como match" />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {editMode && (
              <div className="flex justify-end gap-2 pt-4">
                <Button onClick={handleCancel} variant="outline" className="border-red-700/50 text-red-500 hover:bg-red-700/10" disabled={isLoading}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} className="bg-blue-700 hover:bg-blue-800" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isNewProject ? "Creando..." : "Guardando..."}
                    </>
                  ) : (
                    isNewProject ? "Crear Proyecto" : "Guardar"
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
