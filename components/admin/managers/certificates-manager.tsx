"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { fetchCertificates } from "@/services/api/certificates"
import {
  createCertificateAction,
  updateCertificateAction,
  deleteCertificateAction,
} from "@/lib/actions/certificates"
import { useToastNotifications } from "@/hooks/admin/use-toast-notifications"
import { ConfirmationDialog } from "@/components/admin/common/confirmation-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { TextField, TextAreaField, StringListField } from "@/components/admin/forms/project-form-fields"

interface AdminCertificate {
  _id: string
  title: string
  slug?: string
  issuer: string
  category?: string
  date: string
  duration?: string
  credentialUrl?: string
  image?: string
  techStack?: string[]
  learned?: string
  applied?: string
}

const emptyCertificate: AdminCertificate = {
  _id: "",
  title: "",
  issuer: "",
  date: new Date().toISOString().split("T")[0],
}

export default function CertificatesManager() {
  const toastNotifications = useToastNotifications()
  const [items, setItems] = useState<AdminCertificate[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [selected, setSelected] = useState<AdminCertificate | null>(null)
  const [formData, setFormData] = useState<AdminCertificate | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [toDelete, setToDelete] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setIsFetching(true)
      try {
        const result = await fetchCertificates()
        setItems(result)
      } finally {
        setIsFetching(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    setFormData(selected)
  }, [selected])

  const selectItem = (item: AdminCertificate) => {
    setSelected(item)
    setEditMode(false)
    setIsNew(false)
  }

  const addNew = () => {
    setSelected({ ...emptyCertificate })
    setIsNew(true)
    setEditMode(true)
  }

  const handleSave = async () => {
    if (!formData) return
    setIsLoading(true)
    try {
      if (isNew) {
        const { _id, ...payload } = formData
        const created = await createCertificateAction(payload)
        setItems((prev) => [created, ...prev])
        setSelected(created)
        toastNotifications.showCreatedToast("Certificado")
      } else {
        const updated = await updateCertificateAction(formData._id, formData)
        setItems((prev) => prev.map((c) => (c._id === updated._id ? updated : c)))
        setSelected(updated)
        toastNotifications.showUpdatedToast("Certificado")
      }
      setEditMode(false)
      setIsNew(false)
    } catch (error) {
      console.error(error)
      toastNotifications.showErrorToast("Error", "No se pudo guardar el certificado.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return
    try {
      const target = items.find((c) => c._id === toDelete)
      await deleteCertificateAction(toDelete, target?.slug || "")
      setItems((prev) => prev.filter((c) => c._id !== toDelete))
      if (selected?._id === toDelete) setSelected(null)
      toastNotifications.showDeletedToast("Certificado")
    } catch (error) {
      console.error(error)
      toastNotifications.showErrorToast("Error", "No se pudo eliminar el certificado.")
    } finally {
      setIsDeleteOpen(false)
      setToDelete(null)
    }
  }

  const disabled = !editMode

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Certificados</h2>
        <Button onClick={addNew} className="bg-blue-700 hover:bg-blue-800">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Certificado
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <Card className="bg-black/40 border-blue-700/20">
            <CardHeader>
              <CardTitle>Certificados</CardTitle>
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
                    <p className="text-xs text-white/60 mt-1 truncate">{item.issuer}</p>
                  </div>
                ))}
                {items.length === 0 && !isFetching && <p className="text-center text-slate-400 py-4">No hay certificados.</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card className="bg-black/40 border-blue-700/20">
            <CardHeader>
              <CardTitle>{isNew ? "Crear Certificado" : editMode ? "Editar Certificado" : "Detalle"}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <LoadingSpinner size="lg" text="Guardando..." />
                </div>
              ) : !formData ? (
                <p className="text-center text-slate-400 py-4">Seleccioná un certificado o creá uno nuevo.</p>
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
                  <TextField label="Slug (URL pública, vacío = se genera del título)" value={formData.slug} onChange={(v) => setFormData({ ...formData, slug: v })} disabled={disabled} placeholder="mi-certificado" />
                  <TextField label="Emisor" value={formData.issuer} onChange={(v) => setFormData({ ...formData, issuer: v })} disabled={disabled} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fecha</label>
                      <input
                        type="date"
                        value={formData.date ? String(formData.date).slice(0, 10) : ""}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        disabled={disabled}
                        className="flex h-10 w-full rounded-md border border-blue-700/20 bg-black/40 px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <TextField label="Duración" value={formData.duration} onChange={(v) => setFormData({ ...formData, duration: v })} disabled={disabled} placeholder="ej. 40 horas" />
                  </div>
                  <TextField label="Categoría" value={formData.category} onChange={(v) => setFormData({ ...formData, category: v })} disabled={disabled} />
                  <TextField label="URL de la credencial" value={formData.credentialUrl} onChange={(v) => setFormData({ ...formData, credentialUrl: v })} disabled={disabled} />
                  <TextField label="Imagen (URL)" value={formData.image} onChange={(v) => setFormData({ ...formData, image: v })} disabled={disabled} />
                  <StringListField label="Tecnologías cubiertas" values={formData.techStack} onChange={(v) => setFormData({ ...formData, techStack: v })} disabled={disabled} />
                  <TextAreaField label="Qué aprendí" value={formData.learned} onChange={(v) => setFormData({ ...formData, learned: v })} disabled={disabled} />
                  <TextAreaField label="Cómo lo apliqué" value={formData.applied} onChange={(v) => setFormData({ ...formData, applied: v })} disabled={disabled} />

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
        title="Eliminar Certificado"
        description="¿Estás seguro de que deseas eliminar este certificado?"
      />
    </motion.div>
  )
}
