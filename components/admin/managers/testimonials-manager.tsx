"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Star } from "lucide-react"
import { fetchTestimonials } from "@/services/api/testimonials"
import { fetchProjects } from "@/services/api/projects"
import {
  createTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction,
} from "@/lib/actions/testimonials"
import { useToastNotifications } from "@/hooks/admin/use-toast-notifications"
import { ConfirmationDialog } from "@/components/admin/common/confirmation-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { TextField, TextAreaField } from "@/components/admin/forms/project-form-fields"

/**
 * Manager de Testimonios del Admin — lista + panel de crear/editar (Server Actions, lib/actions/testimonials.ts).
 * Recibe: nada (carga testimonios + catálogo de proyectos al montar).
 * Produce: CRUD completo, con repeater de `links[]` a proyectos/automatizaciones para testimonios tipo "resultado".
 */
interface TestimonialLink {
  type: "proyecto" | "automatizacion"
  ref: string
}

interface AdminTestimonial {
  _id: string
  author: string
  role?: string
  email?: string
  photo?: string
  content: string
  type: "personal" | "resultado"
  rating?: number
  links: TestimonialLink[]
}

interface ProjectOption {
  _id: string
  title: string
  category: string
}

const emptyTestimonial: AdminTestimonial = {
  _id: "",
  author: "",
  role: "",
  content: "",
  type: "resultado",
  rating: 5,
  links: [],
}

export default function TestimonialsManager() {
  const toastNotifications = useToastNotifications()
  const [items, setItems] = useState<AdminTestimonial[]>([])
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [selected, setSelected] = useState<AdminTestimonial | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [toDelete, setToDelete] = useState<string | null>(null)
  const [formData, setFormData] = useState<AdminTestimonial | null>(null)

  useEffect(() => {
    const load = async () => {
      setIsFetching(true)
      try {
        const [testimonials, projects] = await Promise.all([fetchTestimonials(), fetchProjects()])
        setItems(testimonials)
        setProjectOptions((projects as any[]).map((p) => ({ _id: p._id, title: p.title, category: p.category })))
      } finally {
        setIsFetching(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    setFormData(selected)
  }, [selected])

  const selectItem = (item: AdminTestimonial) => {
    setSelected(item)
    setEditMode(false)
    setIsNew(false)
  }

  const addNew = () => {
    setSelected({ ...emptyTestimonial })
    setIsNew(true)
    setEditMode(true)
  }

  const handleSave = async () => {
    if (!formData) return
    setIsLoading(true)
    try {
      if (isNew) {
        const { _id, ...payload } = formData
        const created = await createTestimonialAction(payload)
        setItems((prev) => [created, ...prev])
        setSelected(created)
        toastNotifications.showCreatedToast("Testimonio")
      } else {
        const updated = await updateTestimonialAction(formData._id, formData)
        setItems((prev) => prev.map((t) => (t._id === updated._id ? updated : t)))
        setSelected(updated)
        toastNotifications.showUpdatedToast("Testimonio")
      }
      setEditMode(false)
      setIsNew(false)
    } catch (error) {
      console.error(error)
      toastNotifications.showErrorToast("Error", "No se pudo guardar el testimonio.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return
    try {
      await deleteTestimonialAction(toDelete)
      setItems((prev) => prev.filter((t) => t._id !== toDelete))
      if (selected?._id === toDelete) setSelected(null)
      toastNotifications.showDeletedToast("Testimonio")
    } catch (error) {
      console.error(error)
      toastNotifications.showErrorToast("Error", "No se pudo eliminar el testimonio.")
    } finally {
      setIsDeleteOpen(false)
      setToDelete(null)
    }
  }

  const addLink = () => {
    if (!formData) return
    setFormData({ ...formData, links: [...formData.links, { type: "proyecto", ref: "" }] })
  }
  const updateLink = (i: number, patch: Partial<TestimonialLink>) => {
    if (!formData) return
    const links = [...formData.links]
    links[i] = { ...links[i], ...patch }
    setFormData({ ...formData, links })
  }
  const removeLink = (i: number) => {
    if (!formData) return
    setFormData({ ...formData, links: formData.links.filter((_, idx) => idx !== i) })
  }

  const disabled = !editMode

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Testimonios</h2>
        <Button onClick={addNew} className="bg-blue-700 hover:bg-blue-800">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Testimonio
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card className="bg-black/40 border-blue-700/20">
            <CardHeader>
              <CardTitle>Testimonios</CardTitle>
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
                      <h3 className="font-medium text-sm truncate pr-8">{item.author}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-1 absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsDeleteOpen(true)
                          setToDelete(item._id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-white/60 mt-1 truncate">{item.content}</p>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">{item.type}</p>
                  </div>
                ))}
                {items.length === 0 && !isFetching && <p className="text-center text-slate-400 py-4">No hay testimonios.</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card className="bg-black/40 border-blue-700/20">
            <CardHeader>
              <CardTitle>{isNew ? "Crear Testimonio" : editMode ? "Editar Testimonio" : "Detalle"}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <LoadingSpinner size="lg" text="Guardando..." />
                </div>
              ) : !formData ? (
                <p className="text-center text-slate-400 py-4">Seleccioná un testimonio o creá uno nuevo.</p>
              ) : (
                <div className="space-y-4">
                  {!editMode && (
                    <div className="flex justify-end">
                      <Button onClick={() => setEditMode(true)} variant="outline" className="border-blue-700/50 text-blue-500">
                        Editar
                      </Button>
                    </div>
                  )}
                  <TextField label="Autor" value={formData.author} onChange={(v) => setFormData({ ...formData, author: v })} disabled={disabled} />
                  <TextField label="Rol" value={formData.role} onChange={(v) => setFormData({ ...formData, role: v })} disabled={disabled} />
                  <TextField label="Email" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} disabled={disabled} />
                  <TextField label="Foto (URL)" value={formData.photo} onChange={(v) => setFormData({ ...formData, photo: v })} disabled={disabled} />
                  <TextAreaField label="Contenido" value={formData.content} onChange={(v) => setFormData({ ...formData, content: v })} disabled={disabled} />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tipo</label>
                      <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as any })} disabled={disabled}>
                        <SelectTrigger className="bg-black/40 border-blue-700/20"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="personal">Personal</SelectItem>
                          <SelectItem value="resultado">Resultado (vinculado a un proyecto)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-1"><Star className="h-3.5 w-3.5" /> Rating (1-5)</label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={formData.rating ?? 5}
                        onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                        disabled={disabled}
                        className="flex h-10 w-full rounded-md border border-blue-700/20 bg-black/40 px-3 py-2 text-sm text-white"
                      />
                    </div>
                  </div>

                  {formData.type === "resultado" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Proyectos vinculados</label>
                      <div className="space-y-3">
                        {formData.links.map((link, i) => (
                          <div key={i} className="p-3 rounded-md border border-blue-700/20 bg-black/20 flex gap-2 items-center">
                            <Select value={link.type} onValueChange={(v) => updateLink(i, { type: v as any })} disabled={disabled}>
                              <SelectTrigger className="bg-black/40 border-blue-700/20 w-40"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="proyecto">Proyecto</SelectItem>
                                <SelectItem value="automatizacion">Automatización</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={link.ref} onValueChange={(v) => updateLink(i, { ref: v })} disabled={disabled}>
                              <SelectTrigger className="bg-black/40 border-blue-700/20 flex-1"><SelectValue placeholder="Elegí un proyecto" /></SelectTrigger>
                              <SelectContent>
                                {projectOptions.map((p) => (
                                  <SelectItem key={p._id} value={p._id}>{p.title} ({p.category})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {!disabled && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeLink(i)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      {!disabled && (
                        <Button type="button" variant="outline" size="sm" className="border-blue-700/50 text-blue-500" onClick={addLink}>
                          <Plus className="mr-2 h-3.5 w-3.5" />
                          Vincular proyecto
                        </Button>
                      )}
                    </div>
                  )}

                  {editMode && (
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" className="border-red-700/50 text-red-500" onClick={() => { setEditMode(false); setIsNew(false); if (isNew) setSelected(null) }}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSave} className="bg-blue-700 hover:bg-blue-800">
                        {isNew ? "Crear" : "Guardar"}
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
        title="Eliminar Testimonio"
        description="¿Estás seguro de que deseas eliminar este testimonio?"
      />
    </motion.div>
  )
}
