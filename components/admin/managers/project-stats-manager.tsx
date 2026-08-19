"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import { fetchProjects } from "@/services/api/projects"
import {
  listProjectStatsAction,
  upsertProjectStatsAction,
  deleteProjectStatsAction,
} from "@/lib/actions/project-stats"
import { useToastNotifications } from "@/hooks/admin/use-toast-notifications"
import { ConfirmationDialog } from "@/components/admin/common/confirmation-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { TextField } from "@/components/admin/forms/project-form-fields"

interface Metric {
  label: string
  value: string
  statType?: string
}

interface AdminProjectStats {
  _id: string
  link: { type: "proyecto" | "automatizacion"; ref: string }
  metrics: Metric[]
}

interface ProjectOption {
  _id: string
  title: string
  category: string
}

export default function ProjectStatsManager() {
  const toastNotifications = useToastNotifications()
  const [items, setItems] = useState<AdminProjectStats[]>([])
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [selected, setSelected] = useState<AdminProjectStats | null>(null)
  const [formData, setFormData] = useState<AdminProjectStats | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [toDelete, setToDelete] = useState<AdminProjectStats | null>(null)

  const load = async () => {
    setIsFetching(true)
    try {
      const [stats, projects] = await Promise.all([listProjectStatsAction(), fetchProjects()])
      setItems(stats)
      setProjectOptions((projects as any[]).map((p) => ({ _id: p._id, title: p.title, category: p.category })))
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    setFormData(selected)
  }, [selected])

  const selectItem = (item: AdminProjectStats) => {
    setSelected(item)
    setEditMode(false)
    setIsNew(false)
  }

  const addNew = () => {
    setSelected({ _id: "", link: { type: "proyecto", ref: "" }, metrics: [] })
    setIsNew(true)
    setEditMode(true)
  }

  const addMetric = () => {
    if (!formData) return
    setFormData({ ...formData, metrics: [...formData.metrics, { label: "", value: "", statType: "" }] })
  }
  const updateMetric = (i: number, patch: Partial<Metric>) => {
    if (!formData) return
    const metrics = [...formData.metrics]
    metrics[i] = { ...metrics[i], ...patch }
    setFormData({ ...formData, metrics })
  }
  const removeMetric = (i: number) => {
    if (!formData) return
    setFormData({ ...formData, metrics: formData.metrics.filter((_, idx) => idx !== i) })
  }

  const handleSave = async () => {
    if (!formData || !formData.link.ref) {
      toastNotifications.showErrorToast("Falta el proyecto", "Elegí a qué proyecto pertenecen estas métricas.")
      return
    }
    setIsLoading(true)
    try {
      const saved = await upsertProjectStatsAction(formData)
      await load()
      setSelected(saved)
      toastNotifications.showSuccessToast("Métricas guardadas", "Se guardaron correctamente.")
      setEditMode(false)
      setIsNew(false)
    } catch (error) {
      console.error(error)
      toastNotifications.showErrorToast("Error", "No se pudieron guardar las métricas.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return
    try {
      await deleteProjectStatsAction(toDelete._id, toDelete.link.ref)
      setItems((prev) => prev.filter((s) => s._id !== toDelete._id))
      if (selected?._id === toDelete._id) setSelected(null)
      toastNotifications.showDeletedToast("Métrica")
    } catch (error) {
      console.error(error)
      toastNotifications.showErrorToast("Error", "No se pudo eliminar.")
    } finally {
      setIsDeleteOpen(false)
      setToDelete(null)
    }
  }

  const disabled = !editMode
  const projectTitle = (ref: string) => projectOptions.find((p) => p._id === ref)?.title || ref

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Métricas de Proyecto</h2>
        <Button onClick={addNew} className="bg-blue-700 hover:bg-blue-800">
          <Plus className="mr-2 h-4 w-4" />
          Nuevas Métricas
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card className="bg-black/40 border-blue-700/20">
            <CardHeader>
              <CardTitle>Proyectos con métricas</CardTitle>
              <CardDescription>{isFetching ? "Cargando..." : `${items.length} en total`}</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className={`p-3 rounded-md cursor-pointer relative group ${
                      selected?._id === item._id ? "bg-blue-900/30 border border-blue-500" : "bg-black/20 border border-blue-700/20 hover:border-blue-700/50"
                    }`}
                    onClick={() => selectItem(item)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-sm truncate pr-8">{projectTitle(item.link.ref)}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-1 absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsDeleteOpen(true)
                          setToDelete(item)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-white/60 mt-1">{item.metrics.length} métrica(s)</p>
                  </div>
                ))}
                {items.length === 0 && !isFetching && <p className="text-center text-slate-400 py-4">Sin métricas cargadas.</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card className="bg-black/40 border-blue-700/20">
            <CardHeader>
              <CardTitle>{isNew ? "Nuevas métricas" : editMode ? "Editar métricas" : "Detalle"}</CardTitle>
              <CardDescription>Solo datos medibles y verificables — nunca frases ambiguas ("24/7", "inmediato").</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <LoadingSpinner size="lg" text="Guardando..." />
                </div>
              ) : !formData ? (
                <p className="text-center text-slate-400 py-4">Seleccioná un proyecto o cargá métricas nuevas.</p>
              ) : (
                <div className="space-y-4">
                  {!editMode && (
                    <div className="flex justify-end">
                      <Button onClick={() => setEditMode(true)} variant="outline" className="border-blue-700/50 text-blue-500">
                        Editar
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Proyecto</label>
                    <Select
                      value={formData.link.ref}
                      onValueChange={(v) => setFormData({ ...formData, link: { ...formData.link, ref: v } })}
                      disabled={disabled || !isNew}
                    >
                      <SelectTrigger className="bg-black/40 border-blue-700/20"><SelectValue placeholder="Elegí un proyecto" /></SelectTrigger>
                      <SelectContent>
                        {projectOptions.map((p) => (
                          <SelectItem key={p._id} value={p._id}>{p.title} ({p.category})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!isNew && <p className="text-xs text-slate-500">El proyecto no se puede cambiar al editar — borrá y creá de nuevo si hace falta.</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Métricas</label>
                    <div className="space-y-3">
                      {formData.metrics.map((metric, i) => (
                        <div key={i} className="p-3 rounded-md border border-blue-700/20 bg-black/20 grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
                          <TextField label="Etiqueta" value={metric.label} onChange={(v) => updateMetric(i, { label: v })} disabled={disabled} placeholder="ej. Tiempo ahorrado" />
                          <TextField label="Valor" value={metric.value} onChange={(v) => updateMetric(i, { value: v })} disabled={disabled} placeholder="ej. 1200 h" />
                          <div className="flex gap-2 items-end">
                            <div className="flex-1">
                              <TextField label="StatType (opcional)" value={metric.statType} onChange={(v) => updateMetric(i, { statType: v })} disabled={disabled} placeholder="clave del acumulado global" />
                            </div>
                            {!disabled && (
                              <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500" onClick={() => removeMetric(i)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {!disabled && (
                      <Button type="button" variant="outline" size="sm" className="border-blue-700/50 text-blue-500" onClick={addMetric}>
                        <Plus className="mr-2 h-3.5 w-3.5" />
                        Agregar métrica
                      </Button>
                    )}
                  </div>

                  {editMode && (
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" className="border-red-700/50 text-red-500" onClick={() => { setEditMode(false); setIsNew(false); if (isNew) setSelected(null) }}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSave} className="bg-blue-700 hover:bg-blue-800">
                        Guardar
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Métricas"
        description="¿Estás seguro de que deseas eliminar estas métricas?"
      />
    </motion.div>
  )
}
