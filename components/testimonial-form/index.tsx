"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { fetchProjects } from "@/services/api/projects"
import { fetchStatTypes, type StatType } from "@/services/api/stat-types"
import { useToast } from "@/hooks/use-toast"

/**
 * Wizard público de 2 steps para que un cliente deje testimonio (`/testimonial`).
 * Step 1: 5 preguntas fijas sobre Juan como profesional (siempre iguales).
 * Step 2: selección de proyecto/automatización + resultado + métricas candidatas + rating.
 * Recibe: nada (carga catálogo de proyectos + tipos de métrica al montar).
 * Produce: POST a `/api/testimonials` — 1 o 2 documentos (si hay ficha hermana y el cliente acepta
 * enviarlo también) — siempre nace `status: 'pending'`, moderado luego desde el Admin.
 */
interface ProjectOption {
  _id: string
  title: string
  category: string
  slug: string
  relatedProject?: { name: string; href: string }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const TEMPLATE_METRIC_KEYS = ["HOURS_SAVED", "PROCESS_ACCELERATION", "SYSTEM_AVAILABILITY", "AUTONOMOUS_OPERATION"] as const

// Fallback si /api/stat-types no responde — mismos 4 tipos reales confirmados
// contra la colección StatType (ver plan: form-testimonios-2-steps.md).
const FALLBACK_STAT_TYPES: StatType[] = [
  { _id: "hours-saved", key: "HOURS_SAVED", label: "Horas Ahorradas", prefix: "+", suffix: "h" },
  { _id: "process-acceleration", key: "PROCESS_ACCELERATION", label: "Aceleración de Procesos", suffix: "x" },
  { _id: "system-availability", key: "SYSTEM_AVAILABILITY", label: "Disponibilidad del Sistema", suffix: "%" },
  { _id: "autonomous-operation", key: "AUTONOMOUS_OPERATION", label: "Operación Autónoma", suffix: "%" },
]

interface FormState {
  name: string
  email: string
  role: string
  q1: string
  q2: string
  q3: string
  q4: string
  q5: string
  projectId: string
  includeSibling: boolean
  before: string
  after: string
  metricValues: Record<string, string>
  freeMetricLabel: string
  freeMetricValue: string
  adjustments: string
  rating: number
}

const emptyForm: FormState = {
  name: "",
  email: "",
  role: "",
  q1: "",
  q2: "",
  q3: "",
  q4: "",
  q5: "",
  projectId: "",
  includeSibling: false,
  before: "",
  after: "",
  metricValues: {},
  freeMetricLabel: "",
  freeMetricValue: "",
  adjustments: "",
  rating: 5,
}

function buildContent(form: FormState): string {
  const parts = [
    form.q1.trim(),
    form.q2.trim(),
    form.q3.trim(),
    form.q4.trim(),
    form.q5.trim(),
  ].filter(Boolean)

  const resultado = [
    form.before.trim() && `Antes: ${form.before.trim()}`,
    form.after.trim() && `Después: ${form.after.trim()}`,
    form.adjustments.trim() && `Algo a ajustar: ${form.adjustments.trim()}`,
  ].filter(Boolean) as string[]

  return [...parts, ...resultado].join("\n\n")
}

function formatMetricValue(raw: string, statType: StatType | undefined): string {
  const trimmed = raw.trim()
  if (!trimmed) return ""
  return `${statType?.prefix || ""}${trimmed}${statType?.suffix || ""}`
}

function linkTypeForCategory(category: string): "proyecto" | "automatizacion" {
  return category === "automatizacion" ? "automatizacion" : "proyecto"
}

export default function TestimonialForm() {
  const { toast } = useToast()
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [statTypes, setStatTypes] = useState<StatType[]>(FALLBACK_STAT_TYPES)
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const load = async () => {
      setIsLoadingCatalog(true)
      try {
        const [projectList, types] = await Promise.all([fetchProjects(), fetchStatTypes()])
        setProjects(projectList as ProjectOption[])
        if (types.length > 0) setStatTypes(types)
      } finally {
        setIsLoadingCatalog(false)
      }
    }
    load()
  }, [])

  const selectedProject = useMemo(
    () => projects.find((p) => p._id === form.projectId) || null,
    [projects, form.projectId]
  )

  const siblingProject = useMemo(() => {
    if (!selectedProject?.relatedProject?.href) return null
    return projects.find((p) => `/projects/${p.slug}` === selectedProject.relatedProject!.href) || null
  }, [projects, selectedProject])

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const step1Valid = form.name.trim() && EMAIL_RE.test(form.email.trim()) && form.q1.trim() && form.q2.trim() && form.q3.trim() && form.q4.trim() && form.q5.trim()
  const step2Valid = form.projectId && form.before.trim() && form.after.trim()

  const goToStep2 = () => {
    if (!step1Valid) {
      toast({ title: "Faltan datos", description: "Completá tu nombre, correo y las 5 preguntas antes de seguir.", variant: "destructive" })
      return
    }
    setStep(2)
  }

  const handleSubmit = async () => {
    if (!step2Valid) {
      toast({ title: "Faltan datos", description: "Elegí el proyecto y contá el antes/después.", variant: "destructive" })
      return
    }
    if (!selectedProject) return

    const suggestedMetrics = [
      ...TEMPLATE_METRIC_KEYS.map((key) => {
        const statType = statTypes.find((s) => s.key === key)
        const value = formatMetricValue(form.metricValues[key] || "", statType)
        return value ? { label: statType?.label || key, value, statType: key } : null
      }),
      form.freeMetricValue.trim()
        ? { label: form.freeMetricLabel.trim() || "Otro resultado", value: form.freeMetricValue.trim() }
        : null,
    ].filter(Boolean) as { label: string; value: string; statType?: string }[]

    const links = [{ type: linkTypeForCategory(selectedProject.category), ref: selectedProject._id }]
    if (form.includeSibling && siblingProject) {
      links.push({ type: linkTypeForCategory(siblingProject.category), ref: siblingProject._id })
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: form.name.trim(),
          email: form.email.trim(),
          role: form.role.trim() || undefined,
          content: buildContent(form),
          rating: form.rating,
          links,
          suggestedMetrics,
        }),
      })

      if (response.status === 429) {
        toast({ title: "Demasiados intentos", description: "Ya enviaste testimonios seguidos desde acá — probá de nuevo en unos minutos.", variant: "destructive" })
        return
      }

      const data = await response.json()
      if (!response.ok || !data.success) {
        toast({ title: "No se pudo enviar", description: data.message || "Intentá de nuevo en unos minutos.", variant: "destructive" })
        return
      }

      setSubmitted(true)
    } catch (error) {
      console.error("Error enviando testimonio:", error)
      toast({ title: "No se pudo enviar", description: "Hubo un problema de conexión, intentá de nuevo.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md text-center space-y-4">
          <CheckCircle2 className="h-12 w-12 text-blue-500 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Gracias por tu testimonio</h1>
          <p className="text-slate-400">
            Lo recibí y lo voy a revisar antes de publicarlo — no aparece en el sitio todavía. Si dejaste métricas, también las reviso antes de sumarlas.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 sm:py-24">
      <div className="mb-8 space-y-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Contame tu experiencia</h1>
        <p className="text-slate-400">Dos pasos cortos: primero sobre cómo trabajé con vos, después sobre el resultado del proyecto.</p>
        <Progress value={step === 1 ? 50 : 100} className="h-1.5 bg-white/10" />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            <Card className="bg-black/40 border-blue-700/20">
              <CardHeader>
                <CardTitle>Paso 1 — Sobre el trabajo con Juan</CardTitle>
                <CardDescription>Las mismas 5 preguntas para cualquier proyecto.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tu nombre</Label>
                    <Input value={form.name} onChange={(e) => update("name", e.target.value)} className="bg-black/40 border-blue-700/20" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tu correo</Label>
                    <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="bg-black/40 border-blue-700/20" placeholder="para poder contactarte si hace falta" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tu rol / empresa (opcional)</Label>
                  <Input value={form.role} onChange={(e) => update("role", e.target.value)} className="bg-black/40 border-blue-700/20" placeholder="ej. CEO, Empresa X" />
                </div>

                <div className="space-y-2">
                  <Label>1. Antes de construir, primero entiendo el negocio a fondo — ¿sentiste que entendí bien tu problema, o que fui directo a "construir lo que pediste" sin indagar?</Label>
                  <Textarea value={form.q1} onChange={(e) => update("q1", e.target.value)} className="min-h-[80px] bg-black/40 border-blue-700/20" />
                </div>
                <div className="space-y-2">
                  <Label>2. ¿Cómo fue la comunicación durante el proyecto? (claridad, disponibilidad, avisos de avance)</Label>
                  <Textarea value={form.q2} onChange={(e) => update("q2", e.target.value)} className="min-h-[80px] bg-black/40 border-blue-700/20" />
                </div>
                <div className="space-y-2">
                  <Label>3. No solo entrego código — también me hago cargo de la infraestructura donde corre en producción. ¿Aplicó en tu caso? ¿Cómo lo viviste?</Label>
                  <Textarea value={form.q3} onChange={(e) => update("q3", e.target.value)} className="min-h-[80px] bg-black/40 border-blue-700/20" />
                </div>
                <div className="space-y-2">
                  <Label>4. ¿Cómo describirías mi forma de trabajar / metodología, en tus palabras?</Label>
                  <Textarea value={form.q4} onChange={(e) => update("q4", e.target.value)} className="min-h-[80px] bg-black/40 border-blue-700/20" />
                </div>
                <div className="space-y-2">
                  <Label>5. ¿Me recomendarías como Arquitecto de Soluciones a otro negocio?</Label>
                  <Textarea value={form.q5} onChange={(e) => update("q5", e.target.value)} className="min-h-[80px] bg-black/40 border-blue-700/20" />
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={goToStep2} className="bg-blue-700 hover:bg-blue-800">Siguiente</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
            <Card className="bg-black/40 border-blue-700/20">
              <CardHeader>
                <CardTitle>Paso 2 — El resultado</CardTitle>
                <CardDescription>Sobre el proyecto o automatización puntual.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>¿A qué proyecto o automatización corresponde?</Label>
                  <Select value={form.projectId} onValueChange={(v) => update("projectId", v)} disabled={isLoadingCatalog}>
                    <SelectTrigger className="bg-black/40 border-blue-700/20">
                      <SelectValue placeholder={isLoadingCatalog ? "Cargando..." : "Elegí un proyecto"} />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p._id} value={p._id}>{p.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {siblingProject && (
                  <div className="flex items-start gap-2 p-3 rounded-md border border-blue-700/20 bg-black/20">
                    <Checkbox id="sibling" checked={form.includeSibling} onCheckedChange={(v) => update("includeSibling", v === true)} className="mt-0.5" />
                    <Label htmlFor="sibling" className="font-normal text-sm text-slate-300 cursor-pointer">
                      Enviar también este testimonio para <span className="text-blue-400">{siblingProject.title}</span> (misma solución, ficha aparte)
                    </Label>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>¿Qué proceso o problema tenías antes de esta solución?</Label>
                  <Textarea value={form.before} onChange={(e) => update("before", e.target.value)} className="min-h-[80px] bg-black/40 border-blue-700/20" />
                </div>
                <div className="space-y-2">
                  <Label>¿Qué cambió después de tenerla funcionando?</Label>
                  <Textarea value={form.after} onChange={(e) => update("after", e.target.value)} className="min-h-[80px] bg-black/40 border-blue-700/20" />
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>Métricas (opcional)</Label>
                    <p className="text-xs text-slate-500 mt-1">Completá las que apliquen — solo el número, dejá vacías las que no. Las reviso antes de publicarlas.</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {TEMPLATE_METRIC_KEYS.map((key) => {
                      const statType = statTypes.find((s) => s.key === key)
                      return (
                        <div key={key} className="space-y-1.5">
                          <Label className="text-xs text-slate-400">{statType?.label || key}</Label>
                          <div className="flex items-center gap-1.5">
                            {statType?.prefix && <span className="text-slate-500 text-sm">{statType.prefix}</span>}
                            <Input
                              value={form.metricValues[key] || ""}
                              onChange={(e) => update("metricValues", { ...form.metricValues, [key]: e.target.value })}
                              className="bg-black/40 border-blue-700/20"
                              placeholder="0"
                            />
                            {statType?.suffix && <span className="text-slate-500 text-sm">{statType.suffix}</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-400">Otro resultado medible (opcional)</Label>
                      <Input value={form.freeMetricLabel} onChange={(e) => update("freeMetricLabel", e.target.value)} className="bg-black/40 border-blue-700/20" placeholder="ej. Errores reducidos" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-400">Valor</Label>
                      <Input value={form.freeMetricValue} onChange={(e) => update("freeMetricValue", e.target.value)} className="bg-black/40 border-blue-700/20" placeholder="ej. -80%" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>¿Algo que ajustar/mejorar en el camino? (opcional)</Label>
                  <Textarea value={form.adjustments} onChange={(e) => update("adjustments", e.target.value)} className="min-h-[70px] bg-black/40 border-blue-700/20" />
                </div>

                <div className="space-y-2">
                  <Label>Tu valoración</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => update("rating", n)} aria-label={`${n} estrellas`}>
                        <Star className={`h-6 w-6 ${n <= form.rating ? "fill-blue-500 text-blue-500" : "text-white/20"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="outline" className="border-blue-700/50 text-blue-500" onClick={() => setStep(1)} disabled={isSubmitting}>
                    Atrás
                  </Button>
                  <Button onClick={handleSubmit} className="bg-blue-700 hover:bg-blue-800" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enviar testimonio
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
