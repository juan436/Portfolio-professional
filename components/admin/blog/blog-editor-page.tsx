"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Eye, Languages, Loader2, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TextField, TextAreaField, StringListField } from "@/components/admin/forms/project-form-fields"
import { RichTextEditor } from "@/components/admin/forms/rich-text-editor"
import { MediaUploader } from "@/components/admin/media-uploader"
import { useToastNotifications } from "@/hooks/admin/use-toast-notifications"
import { deriveExcerpt } from "@/lib/blog/text"
import {
  createBlogPostAction,
  updateBlogPostAction,
  getBlogPostByIdAction,
  retranslateBlogLocaleAction,
} from "@/lib/actions/blog"

/**
 * "Modo Escritura" — página propia de creación/edición de un post de blog
 * (`/admin/blog/new` y `/admin/blog/[id]`), a pantalla completa, sin el
 * chrome del dashboard. Metadatos en un modal "Detalles", traducciones
 * revisables/editables en un modal "Traducciones", y botón de vista previa.
 * Recibe: `postId` opcional (ausente = post nuevo).
 * Produce: formulario completo con guardado real vía Server Actions.
 */
const LOCALES = [
  { code: "en", label: "Inglés" },
  { code: "fr", label: "Francés" },
  { code: "it", label: "Italiano" },
] as const

type LocaleCode = (typeof LOCALES)[number]["code"]
type LocaleFields = { title: string; excerpt: string; body: string }
type Translations = Record<LocaleCode, LocaleFields>

interface FormState {
  title: string
  excerpt: string
  coverImage: string
  tags: string[]
  status: "draft" | "published"
  body: string
  translations: Translations
}

const emptyLocale = (): LocaleFields => ({ title: "", excerpt: "", body: "" })
const emptyTranslations = (): Translations => ({ en: emptyLocale(), fr: emptyLocale(), it: emptyLocale() })

const emptyForm: FormState = {
  title: "",
  excerpt: "",
  coverImage: "",
  tags: [],
  status: "draft",
  body: "",
  translations: emptyTranslations(),
}

export function BlogEditorPage({ postId }: { postId?: string }) {
  const router = useRouter()
  const toastNotifications = useToastNotifications()

  const isNew = !postId
  const [isFetching, setIsFetching] = useState(!isNew)
  const [notFound, setNotFound] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [savedSlug, setSavedSlug] = useState<string>("")
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [translationsOpen, setTranslationsOpen] = useState(false)
  const [retranslating, setRetranslating] = useState<LocaleCode | null>(null)
  const [saving, setSaving] = useState<"draft" | "published" | null>(null)
  const titleRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [form.title])

  useEffect(() => {
    if (isNew) return
    let cancelled = false
    getBlogPostByIdAction(postId!)
      .then((post) => {
        if (cancelled) return
        const tr = emptyTranslations()
        for (const { code } of LOCALES) {
          const src = post.translations?.[code]
          if (src) tr[code] = { title: src.title || "", excerpt: src.excerpt || "", body: src.body || "" }
        }
        setForm({
          title: post.title || "",
          excerpt: post.excerpt || "",
          coverImage: post.coverImage || "",
          tags: post.tags || [],
          status: post.status || "draft",
          body: post.body || "",
          translations: tr,
        })
        setSavedSlug(post.slug || "")
      })
      .catch(() => {
        if (!cancelled) setNotFound(true)
      })
      .finally(() => {
        if (!cancelled) setIsFetching(false)
      })
    return () => {
      cancelled = true
    }
  }, [isNew, postId])

  const buildPayload = (status: "draft" | "published") => {
    const excerpt = form.excerpt.trim() || deriveExcerpt(form.body) || form.title.trim()
    return { ...form, excerpt, status }
  }

  const save = async (status: "draft" | "published") => {
    if (!form.title.trim()) {
      toastNotifications.showErrorToast("Falta el título", "Escribí un título antes de guardar.")
      return
    }
    setSaving(status)
    try {
      const payload = buildPayload(status)
      if (isNew) {
        const created = await createBlogPostAction(payload)
        toastNotifications.showCreatedToast("Artículo")
        router.push(`/admin/blog/${created._id}`)
      } else {
        await updateBlogPostAction(postId!, payload)
        toastNotifications.showUpdatedToast("Artículo")
        router.push("/admin/blog")
      }
    } catch (error) {
      console.error(error)
      const message = error instanceof Error ? error.message : "No se pudo guardar el artículo."
      toastNotifications.showErrorToast("Error", message)
    } finally {
      setSaving(null)
    }
  }

  const openPreview = async () => {
    if (isNew) {
      toastNotifications.showErrorToast("Guardá primero", "Guardá un borrador para poder previsualizar.")
      return
    }
    if (!savedSlug) return
    window.open(`/blog/${savedSlug}?preview=1`, "_blank", "noopener")
  }

  const setTranslationField = (code: LocaleCode, field: keyof LocaleFields, value: string) => {
    setForm((prev) => ({
      ...prev,
      translations: { ...prev.translations, [code]: { ...prev.translations[code], [field]: value } },
    }))
  }

  const retranslate = async (code: LocaleCode) => {
    setRetranslating(code)
    try {
      const result = await retranslateBlogLocaleAction(code, {
        title: form.title,
        excerpt: form.excerpt,
        body: form.body,
      })
      setForm((prev) => ({
        ...prev,
        translations: {
          ...prev.translations,
          [code]: {
            title: result.title || "",
            excerpt: result.excerpt || "",
            body: result.body || "",
          },
        },
      }))
      toastNotifications.showSuccessToast("Traducción lista", "Revisá y guardá para aplicarla.")
    } catch (error) {
      console.error(error)
      toastNotifications.showErrorToast("Error", "No se pudo retraducir.")
    } finally {
      setRetranslating(null)
    }
  }

  if (isFetching) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando artículo..." />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-center px-6">
        <p className="text-slate-400">No encontramos este artículo.</p>
        <Link href="/admin/blog" className="text-blue-500 hover:text-blue-400 text-sm">
          Volver al listado
        </Link>
      </div>
    )
  }

  const isPublished = !isNew && form.status === "published"

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="h-16 flex items-center justify-between px-8 border-b border-blue-700/20">
        <Link href="/admin/blog" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Blog
        </Link>
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Traducciones"
            aria-label="Traducciones"
            onClick={() => setTranslationsOpen(true)}
            className="h-9 w-9 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Languages className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Detalles (extracto, portada)"
            aria-label="Detalles"
            onClick={() => setDetailsOpen(true)}
            className="h-9 w-9 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Settings2 className="h-4 w-4" />
          </button>
          {!isNew && (
            <button
              type="button"
              title="Vista previa"
              aria-label="Vista previa"
              onClick={openPreview}
              className="h-9 w-9 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors mr-2"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          {!isPublished && (
            <Button
              variant="outline"
              className="border-blue-700/50 text-blue-500"
              disabled={saving !== null}
              onClick={() => save("draft")}
            >
              {saving === "draft" ? "Guardando..." : isNew ? "Guardar borrador" : "Guardar cambios"}
            </Button>
          )}
          {isPublished && (
            <Button
              variant="outline"
              className="border-blue-700/50 text-blue-500"
              disabled={saving !== null}
              onClick={() => save("published")}
            >
              {saving === "published" ? "Guardando..." : "Guardar cambios"}
            </Button>
          )}
          {!isPublished && (
            <Button className="bg-blue-700 hover:bg-blue-800" disabled={saving !== null} onClick={() => save("published")}>
              {saving === "published" ? "Publicando..." : "Publicar"}
            </Button>
          )}
        </div>
      </header>

      <main className="flex flex-col items-center px-10 pt-14 pb-28">
        <div className="w-full max-w-[820px]">
          <textarea
            ref={titleRef}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Título del artículo"
            rows={1}
            className="w-full bg-transparent border-none outline-none resize-none overflow-hidden text-white text-[38px] font-extrabold leading-tight placeholder:text-slate-700 mb-3.5"
          />

          <div className="flex items-center gap-2.5 text-[13px] text-slate-500 mb-5">
            <span className="bg-white/5 border border-white/10 rounded-md px-2 py-0.5 text-slate-300">
              {form.status === "published" ? "Publicado" : "Borrador"}
            </span>
            <span>·</span>
            <button
              type="button"
              onClick={() => setDetailsOpen(true)}
              className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-400"
            >
              Extracto y portada
            </button>
          </div>

          <div className="mb-10">
            <StringListField
              label="Etiquetas"
              values={form.tags}
              onChange={(v) => setForm({ ...form, tags: v })}
              placeholder="ej. agentes, ia, arquitectura"
            />
          </div>

          <RichTextEditor value={form.body} onChange={(html) => setForm({ ...form, body: html })} />
        </div>
      </main>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="bg-black border-blue-700/20 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del artículo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <TextAreaField
              label="Extracto (resumen corto, se muestra en el listado)"
              value={form.excerpt}
              onChange={(v) => setForm({ ...form, excerpt: v })}
            />
            <MediaUploader
              kind="image"
              label="Imagen de portada"
              value={form.coverImage}
              onChange={(v) => setForm({ ...form, coverImage: v })}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={translationsOpen} onOpenChange={setTranslationsOpen}>
        <DialogContent className="bg-black border-blue-700/20 max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Traducciones</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-slate-500 pt-1">
            Se autogeneran al guardar. Lo que edités a mano acá gana sobre la autotraducción. El cuerpo va como HTML.
          </p>
          <div className="space-y-8 pt-3">
            {LOCALES.map(({ code, label }) => (
              <div key={code} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wide">{label}</h3>
                  <button
                    type="button"
                    onClick={() => retranslate(code)}
                    disabled={retranslating !== null || !form.title.trim()}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white disabled:opacity-40"
                  >
                    {retranslating === code ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Languages className="h-3.5 w-3.5" />}
                    Retraducir este idioma
                  </button>
                </div>
                <TextField
                  label="Título"
                  value={form.translations[code].title}
                  onChange={(v) => setTranslationField(code, "title", v)}
                />
                <TextAreaField
                  label="Extracto"
                  value={form.translations[code].excerpt}
                  onChange={(v) => setTranslationField(code, "excerpt", v)}
                />
                <TextAreaField
                  label="Cuerpo (HTML)"
                  value={form.translations[code].body}
                  onChange={(v) => setTranslationField(code, "body", v)}
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
