"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import {
  listBlogPostsAction,
  createBlogPostAction,
  updateBlogPostAction,
  deleteBlogPostAction,
} from "@/lib/actions/blog"
import { useToastNotifications } from "@/hooks/admin/use-toast-notifications"
import { ConfirmationDialog } from "@/components/admin/common/confirmation-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { TextField, TextAreaField, StringListField, WorkProcessEditor } from "@/components/admin/forms/project-form-fields"

interface ContentBlock {
  kind: "paragraph" | "steps"
  text?: string
  items?: string[]
}

interface AdminBlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  coverImage?: string
  body: ContentBlock[]
  tags?: string[]
  status: "draft" | "published"
  publishedAt?: string
}

const emptyPost: AdminBlogPost = {
  _id: "",
  title: "",
  slug: "",
  excerpt: "",
  body: [],
  tags: [],
  status: "draft",
}

export default function BlogManager() {
  const toastNotifications = useToastNotifications()
  const [items, setItems] = useState<AdminBlogPost[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [selected, setSelected] = useState<AdminBlogPost | null>(null)
  const [formData, setFormData] = useState<AdminBlogPost | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [toDelete, setToDelete] = useState<string | null>(null)

  const load = async () => {
    setIsFetching(true)
    try {
      const posts = await listBlogPostsAction()
      setItems(posts)
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

  const selectItem = (item: AdminBlogPost) => {
    setSelected(item)
    setEditMode(false)
    setIsNew(false)
  }

  const addNew = () => {
    setSelected({ ...emptyPost })
    setIsNew(true)
    setEditMode(true)
  }

  const handleSave = async () => {
    if (!formData) return
    setIsLoading(true)
    try {
      if (isNew) {
        const { _id, ...payload } = formData
        const created = await createBlogPostAction(payload)
        await load()
        setSelected(created)
        toastNotifications.showCreatedToast("Artículo")
      } else {
        const updated = await updateBlogPostAction(formData._id, formData)
        await load()
        setSelected(updated)
        toastNotifications.showUpdatedToast("Artículo")
      }
      setEditMode(false)
      setIsNew(false)
    } catch (error) {
      console.error(error)
      toastNotifications.showErrorToast("Error", "No se pudo guardar el artículo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return
    try {
      await deleteBlogPostAction(toDelete)
      setItems((prev) => prev.filter((p) => p._id !== toDelete))
      if (selected?._id === toDelete) setSelected(null)
      toastNotifications.showDeletedToast("Artículo")
    } catch (error) {
      console.error(error)
      toastNotifications.showErrorToast("Error", "No se pudo eliminar el artículo.")
    } finally {
      setIsDeleteOpen(false)
      setToDelete(null)
    }
  }

  const disabled = !editMode

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Blog</h2>
        <Button onClick={addNew} className="bg-blue-700 hover:bg-blue-800">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Artículo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card className="bg-black/40 border-blue-700/20">
            <CardHeader>
              <CardTitle>Artículos</CardTitle>
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
                      <h3 className="font-medium text-sm truncate pr-8">{item.title}</h3>
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
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wide">{item.status === "published" ? "Publicado" : "Borrador"}</p>
                  </div>
                ))}
                {items.length === 0 && !isFetching && <p className="text-center text-slate-400 py-4">No hay artículos.</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card className="bg-black/40 border-blue-700/20">
            <CardHeader>
              <CardTitle>{isNew ? "Crear Artículo" : editMode ? "Editar Artículo" : "Detalle"}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <LoadingSpinner size="lg" text="Guardando..." />
                </div>
              ) : !formData ? (
                <p className="text-center text-slate-400 py-4">Seleccioná un artículo o creá uno nuevo.</p>
              ) : (
                <div className="space-y-4">
                  {!editMode && (
                    <div className="flex justify-end">
                      <Button onClick={() => setEditMode(true)} variant="outline" className="border-blue-700/50 text-blue-500">
                        Editar
                      </Button>
                    </div>
                  )}
                  <TextField label="Título" value={formData.title} onChange={(v) => setFormData({ ...formData, title: v })} disabled={disabled} />
                  <TextField label="Slug (vacío = se genera del título)" value={formData.slug} onChange={(v) => setFormData({ ...formData, slug: v })} disabled={disabled} placeholder="mi-articulo-nuevo" />
                  <TextAreaField label="Extracto (resumen corto, se muestra en el listado)" value={formData.excerpt} onChange={(v) => setFormData({ ...formData, excerpt: v })} disabled={disabled} />
                  <TextField label="Imagen de portada (URL)" value={formData.coverImage} onChange={(v) => setFormData({ ...formData, coverImage: v })} disabled={disabled} />
                  <StringListField label="Etiquetas" values={formData.tags} onChange={(v) => setFormData({ ...formData, tags: v })} disabled={disabled} />

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estado</label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as any })} disabled={disabled}>
                      <SelectTrigger className="bg-black/40 border-blue-700/20"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Borrador</SelectItem>
                        <SelectItem value="published">Publicado</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">Solo los artículos "Publicado" aparecen en /blog. La fecha de publicación se registra sola la primera vez que pasa a Publicado.</p>
                  </div>

                  <WorkProcessEditor label="Contenido del artículo (bloques de párrafo o lista)" blocks={formData.body} onChange={(v) => setFormData({ ...formData, body: v as any })} disabled={disabled} />

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
        title="Eliminar Artículo"
        description="¿Estás seguro de que deseas eliminar este artículo?"
      />
    </motion.div>
  )
}
