"use client"

import { useEffect, useMemo, useState } from "react"
import { Inter, Bricolage_Grotesque } from "next/font/google"
import { motion, AnimatePresence } from "framer-motion"
import { Star, CheckCircle2, Loader2, ArrowRight, Info, ChevronDown } from "lucide-react"
import { fetchProjects } from "@/services/api/projects"
import { fetchStatTypes, type StatType } from "@/services/api/stat-types"
import { useToast } from "@/hooks/use-toast"
import styles from "./testimonial-form.module.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-display" })

/**
 * Wizard público de 12 pasos (uno por pregunta/métrica) para que un cliente deje testimonio (`/testimonial`).
 * Pasos 1-6: sobre el trabajo con Juan (contacto + 5 preguntas fijas). Pasos 7-12: el resultado
 * (proyecto/antes-después, horas ahorradas, aceleración, ajustes, otro resultado, rating).
 * Identidad visual propia (`testimonial-form.module.css`), a propósito distinta del resto del sitio.
 * Página standalone, sin Navbar/Footer (ver `components/layout/site-chrome.tsx`).
 * Recibe: `initialProjectSlug?`. Si viene, el proyecto queda fijo y no se pide elegirlo.
 * Produce: POST a `/api/testimonials`, 1 o 2 documentos (ficha hermana), siempre `status: 'pending'`.
 */
interface ProjectOption {
  _id: string
  title: string
  category: string
  slug: string
  relatedProject?: { name: string; href: string }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const TOTAL_STEPS = 12
const STEP_CATEGORY: Record<number, string> = {
  1: "Sobre el trabajo con Juan", 2: "Sobre el trabajo con Juan", 3: "Sobre el trabajo con Juan",
  4: "Sobre el trabajo con Juan", 5: "Sobre el trabajo con Juan", 6: "Sobre el trabajo con Juan",
  7: "El resultado", 8: "El resultado", 9: "El resultado", 10: "El resultado", 11: "El resultado", 12: "El resultado",
}
const TIME_UNITS = ["minutos", "horas", "días"] as const

const FALLBACK_STAT_TYPES: StatType[] = [
  { _id: "hours-saved", key: "HOURS_SAVED", label: "Horas Ahorradas", prefix: "+", suffix: "h" },
  { _id: "process-acceleration", key: "PROCESS_ACCELERATION", label: "Aceleración de Procesos", suffix: "x" },
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
  hoursValue: string
  accelBefore: string
  accelAfter: string
  accelUnit: (typeof TIME_UNITS)[number]
  adjustments: string
  wantsExtraMetric: boolean
  freeMetricLabel: string
  freeMetricValue: string
  rating: number
}

const emptyForm: FormState = {
  name: "", email: "", role: "",
  q1: "", q2: "", q3: "", q4: "", q5: "",
  projectId: "", includeSibling: false,
  before: "", after: "",
  hoursValue: "",
  accelBefore: "", accelAfter: "", accelUnit: "horas",
  adjustments: "",
  wantsExtraMetric: false, freeMetricLabel: "", freeMetricValue: "",
  rating: 5,
}

function buildContent(form: FormState): string {
  const parts = [form.q1.trim(), form.q2.trim(), form.q3.trim(), form.q4.trim(), form.q5.trim()].filter(Boolean)
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

function computeAcceleration(beforeRaw: string, afterRaw: string): number | "invalid" | null {
  const before = parseFloat(beforeRaw)
  const after = parseFloat(afterRaw)
  if (!isFinite(before) || !isFinite(after) || before <= 0 || after <= 0) return null
  if (after > before) return "invalid"
  return Math.round((before / after) * 10) / 10
}

function formatMultiplier(ratio: number, suffix: string): string {
  const rounded = Math.abs(ratio % 1) < 0.05 ? Math.round(ratio) : Number(ratio.toFixed(1))
  return `${rounded}${suffix || "x"}`
}

export default function TestimonialForm({ initialProjectSlug }: { initialProjectSlug?: string }) {
  const { toast } = useToast()
  const [step, setStep] = useState<number | "done">(1)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [statTypes, setStatTypes] = useState<StatType[]>(FALLBACK_STAT_TYPES)
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [projectLocked, setProjectLocked] = useState(false)

  useEffect(() => {
    const load = async () => {
      setIsLoadingCatalog(true)
      try {
        const [projectList, types] = await Promise.all([fetchProjects(), fetchStatTypes()])
        setProjects(projectList as ProjectOption[])
        if (types.length > 0) setStatTypes(types)

        if (initialProjectSlug) {
          const match = (projectList as ProjectOption[]).find((p) => p.slug === initialProjectSlug)
          if (match) {
            setForm((prev) => ({ ...prev, projectId: match._id }))
            setProjectLocked(true)
          }
        }
      } finally {
        setIsLoadingCatalog(false)
      }
    }
    load()
  }, [initialProjectSlug])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [step])

  const selectedProject = useMemo(
    () => projects.find((p) => p._id === form.projectId) || null,
    [projects, form.projectId]
  )
  const siblingProject = useMemo(() => {
    if (!selectedProject?.relatedProject?.href) return null
    return projects.find((p) => `/projects/${p.slug}` === selectedProject.relatedProject!.href) || null
  }, [projects, selectedProject])

  const hoursType = statTypes.find((s) => s.key === "HOURS_SAVED")
  const accelType = statTypes.find((s) => s.key === "PROCESS_ACCELERATION")
  const accelRatio = useMemo(() => computeAcceleration(form.accelBefore, form.accelAfter), [form.accelBefore, form.accelAfter])
  const hoursAnnual = useMemo(() => {
    const weekly = parseFloat(form.hoursValue)
    return isFinite(weekly) && weekly > 0 ? Math.round(weekly * 52) : null
  }, [form.hoursValue])

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const requireField = (value: string, message: string) => {
    if (!value.trim()) {
      toast({ title: "Falta un dato", description: message, variant: "destructive" })
      return false
    }
    return true
  }

  const goNext = (current: number, next: number) => {
    if (current === 1 && (!requireField(form.name, "Escribe tu nombre.") || !EMAIL_RE.test(form.email.trim()))) {
      if (form.name.trim() && !EMAIL_RE.test(form.email.trim())) {
        toast({ title: "Correo inválido", description: "Revisa el formato de tu correo.", variant: "destructive" })
      }
      return
    }
    if (current === 2 && !requireField(form.q1, "Escribe algo antes de seguir.")) return
    if (current === 3 && !requireField(form.q2, "Escribe algo antes de seguir.")) return
    if (current === 4 && !requireField(form.q3, "Escribe algo antes de seguir.")) return
    if (current === 5 && !requireField(form.q4, "Escribe algo antes de seguir.")) return
    if (current === 6 && !requireField(form.q5, "Escribe algo antes de seguir.")) return
    if (current === 7) {
      if (!projectLocked && !form.projectId) {
        toast({ title: "Falta un dato", description: "Elige a qué proyecto corresponde.", variant: "destructive" })
        return
      }
      if (!requireField(form.before, "Cuéntanos qué proceso tenías antes.")) return
      if (!requireField(form.after, "Cuéntanos qué cambió después.")) return
    }
    setStep(next)
  }

  const goTo = (next: number) => setStep(next)

  const handleSubmit = async () => {
    if (!selectedProject) return

    const suggestedMetrics: { label: string; value: string; statType?: string }[] = []
    if (form.hoursValue.trim()) {
      const value = formatMetricValue(form.hoursValue, hoursType)
      if (value) suggestedMetrics.push({ label: hoursType?.label || "Horas Ahorradas", value, statType: "HOURS_SAVED" })
    }
    if (typeof accelRatio === "number") {
      suggestedMetrics.push({
        label: accelType?.label || "Aceleración de Procesos",
        value: formatMultiplier(accelRatio, accelType?.suffix || "x"),
        statType: "PROCESS_ACCELERATION",
      })
    }
    if (form.wantsExtraMetric && form.freeMetricValue.trim()) {
      suggestedMetrics.push({ label: form.freeMetricLabel.trim() || "Otro resultado", value: form.freeMetricValue.trim() })
    }

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
        toast({ title: "Demasiados intentos", description: "Ya enviaste varios testimonios seguidos desde acá. Intenta de nuevo en unos minutos.", variant: "destructive" })
        return
      }
      const data = await response.json()
      if (!response.ok || !data.success) {
        toast({ title: "No se pudo enviar", description: data.message || "Intenta de nuevo en unos minutos.", variant: "destructive" })
        return
      }
      setStep("done")
    } catch (error) {
      console.error("Error enviando testimonio:", error)
      toast({ title: "No se pudo enviar", description: "Hubo un problema de conexión. Intenta de nuevo.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const rootClassName = `${styles.root} ${inter.variable} ${bricolage.variable}`

  if (step === "done") {
    return (
      <div className={rootClassName}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`${styles.card} ${styles.doneCard}`} style={{ maxWidth: 480, marginTop: "12vh" }}>
          <div className={styles.doneBadge}>
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className={styles.doneTitle}>Gracias por tu testimonio</h1>
          <p className={styles.doneText}>
            Lo recibí y lo voy a revisar antes de publicarlo. No aparece en el sitio todavía. Si dejaste métricas, también las reviso antes de sumarlas.
          </p>
        </motion.div>
      </div>
    )
  }

  const s = step as number

  const questionCard = (title: string, hint: string | null, value: string, onChange: (v: string) => void, back: number, next: number) => (
    <motion.div key={`step${s}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>{title}</h2>
          {hint && <p className={styles.cardSub}>{hint}</p>}
        </div>
        <textarea value={value} onChange={(e) => onChange(e.target.value)} className={styles.textarea} placeholder="Cuéntame brevemente..." />
        <div className={styles.actions}>
          <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => goTo(back)}>Atrás</button>
          <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => goNext(s, next)}>Siguiente</button>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className={rootClassName}>
      <div className={styles.meta}>
        <span className={styles.eyebrow}>Testimonio</span>
        <p className={styles.metaText}>Cuéntame tu experiencia. Un paso, una idea.</p>
      </div>

      <div className={styles.wizard}>
        <div>
          <div className={styles.progressHead}>
            <span className={styles.cat}>{STEP_CATEGORY[s]}</span>
            <span className={styles.count}>Paso {s} de {TOTAL_STEPS}</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${(s / TOTAL_STEPS) * 100}%` }} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {s === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <h2 className={styles.cardTitle}>Cuéntame cómo fue trabajar conmigo</h2>
                  <p className={styles.cardSub}>Empecemos por ti.</p>
                </div>
                <div className={styles.row3}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Tu nombre</label>
                    <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className={styles.input} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Tu correo</label>
                    <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={styles.input} placeholder="para contactarte si hace falta" />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>Rol / empresa <span className={styles.fieldOptional}>(opcional)</span></label>
                    <input type="text" value={form.role} onChange={(e) => update("role", e.target.value)} className={styles.input} placeholder="ej. CEO, Empresa X" />
                  </div>
                </div>
                <div className={`${styles.actions} ${styles.actionsEnd}`}>
                  <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => goNext(1, 2)}>Siguiente</button>
                </div>
              </div>
            </motion.div>
          )}

          {s === 2 && questionCard(
            "¿Sentiste que entendí tu problema de verdad?",
            "O fui directo a construir lo que pediste, sin indagar antes.",
            form.q1, (v) => update("q1", v), 1, 3
          )}
          {s === 3 && questionCard(
            "¿Cómo fue la comunicación durante el proyecto?",
            "Claridad, disponibilidad, avisos de avance.",
            form.q2, (v) => update("q2", v), 2, 4
          )}
          {s === 4 && questionCard(
            "¿Sentiste que también me hice cargo de la infraestructura?",
            "No solo entrego código. También dejo todo funcionando en producción.",
            form.q3, (v) => update("q3", v), 3, 5
          )}
          {s === 5 && questionCard(
            "¿Cómo describirías mi forma de trabajar, en tus palabras?",
            "Tu versión de mi metodología.",
            form.q4, (v) => update("q4", v), 4, 6
          )}
          {s === 6 && questionCard(
            "¿Me recomendarías a otro negocio?",
            null,
            form.q5, (v) => update("q5", v), 5, 7
          )}

          {s === 7 && (
            <motion.div key="step7" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <h2 className={styles.cardTitle}>Cuéntame el resultado</h2>
                  {projectLocked && selectedProject && (
                    <span className={styles.projectPill}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> {selectedProject.title}
                    </span>
                  )}
                </div>

                {!projectLocked && (
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>¿A qué proyecto o automatización corresponde?</label>
                    <div className={styles.selectWrap}>
                      <select
                        value={form.projectId}
                        onChange={(e) => update("projectId", e.target.value)}
                        disabled={isLoadingCatalog}
                        className={`${styles.input} ${styles.select}`}
                      >
                        <option value="">{isLoadingCatalog ? "Cargando..." : "Elige un proyecto"}</option>
                        {projects.map((p) => (
                          <option key={p._id} value={p._id}>{p.title}</option>
                        ))}
                      </select>
                      <ChevronDown className={`h-4 w-4 ${styles.selectChevron}`} />
                    </div>
                  </div>
                )}

                {siblingProject && (
                  <label htmlFor="sibling" className={styles.checkboxRow}>
                    <input
                      id="sibling" type="checkbox" className={styles.checkbox}
                      checked={form.includeSibling}
                      onChange={(e) => update("includeSibling", e.target.checked)}
                    />
                    <span className={styles.checkboxLabel}>
                      Enviar también este testimonio para <strong>{siblingProject.title}</strong> (misma solución, ficha aparte)
                    </span>
                  </label>
                )}

                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>¿Qué proceso tenías antes de esto?</label>
                    <textarea value={form.before} onChange={(e) => update("before", e.target.value)} className={`${styles.textarea} ${styles.textareaCompact}`} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.fieldLabel}>¿Qué cambió después?</label>
                    <textarea value={form.after} onChange={(e) => update("after", e.target.value)} className={`${styles.textarea} ${styles.textareaCompact}`} />
                  </div>
                </div>

                <div className={styles.actions}>
                  <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => goTo(6)}>Atrás</button>
                  <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => goNext(7, 8)}>Siguiente</button>
                </div>
              </div>
            </motion.div>
          )}

          {s === 8 && (
            <motion.div key="step8" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <h2 className={styles.cardTitle}>¿Cuántas horas por semana te devolvió esto?</h2>
                  <p className={styles.cardSub}>Es opcional. Si no tienes una idea clara, puedes dejarlo vacío.</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className={styles.hoursInputRow}>
                    <input
                      type="number" min={0} step={0.5} inputMode="decimal" placeholder="15"
                      value={form.hoursValue} onChange={(e) => update("hoursValue", e.target.value)}
                      className={styles.hoursInput}
                    />
                    <span className={styles.hoursUnit}>h / semana</span>
                  </div>
                  <div className={`${styles.reveal} ${hoursAnnual !== null ? styles.revealVisible : ""}`}>
                    {hoursAnnual === null ? (
                      <p className={styles.revealHint}>Escribe un número para ver cuánto es al año.</p>
                    ) : (
                      <>
                        <span className={styles.revealNum}>{hoursAnnual.toLocaleString("es")}h</span>
                        <div className={styles.revealLabel}><b>al año</b><span>52 semanas de trabajo</span></div>
                      </>
                    )}
                  </div>
                </div>
                <div className={styles.actions}>
                  <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => goTo(7)}>Atrás</button>
                  <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => goTo(9)}>Siguiente</button>
                </div>
              </div>
            </motion.div>
          )}

          {s === 9 && (
            <motion.div key="step9" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <h2 className={styles.cardTitle}>¿Qué tan más rápido quedó?</h2>
                  <p className={styles.cardSub}>No hagas la cuenta. Dinos cuánto tardaba antes y cuánto tarda ahora, y la sacamos nosotros.</p>
                </div>

                <div className={styles.exampleBox}>
                  <Info className="h-4 w-4" />
                  <p style={{ margin: 0 }}><span className={styles.exampleBoxStrong}>Ejemplo:</span> armar un reporte tomaba 3 días, ahora toma 1 → eso es <span className={styles.exampleBoxStrong}>3× más rápido</span>.</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className={styles.unitPicker} role="group" aria-label="Unidad de tiempo">
                    {TIME_UNITS.map((u) => (
                      <button
                        key={u} type="button" onClick={() => update("accelUnit", u)}
                        className={`${styles.unitBtn} ${form.accelUnit === u ? styles.unitBtnActive : ""}`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>

                  <div className={styles.compareRow}>
                    <div className={styles.compareField}>
                      <label>Antes tardaba</label>
                      <input type="number" min={0} inputMode="decimal" placeholder="3" value={form.accelBefore} onChange={(e) => update("accelBefore", e.target.value)} className={`${styles.input} ${styles.compareInput}`} />
                    </div>
                    <ArrowRight className={styles.compareArrow} />
                    <div className={styles.compareField}>
                      <label>Ahora tarda</label>
                      <input type="number" min={0} inputMode="decimal" placeholder="1" value={form.accelAfter} onChange={(e) => update("accelAfter", e.target.value)} className={`${styles.input} ${styles.compareInput}`} />
                    </div>
                  </div>

                  <div className={`${styles.reveal} ${typeof accelRatio === "number" ? styles.revealVisible : ""}`}>
                    {accelRatio === null && <p className={styles.revealHint}>Completá los dos campos para ver el resultado.</p>}
                    {accelRatio === "invalid" && <p className={styles.revealWarn}>El "ahora" es mayor que el "antes". Revisa los números.</p>}
                    {typeof accelRatio === "number" && (
                      <>
                        <span className={styles.revealNum}>{formatMultiplier(accelRatio, "×")}</span>
                        <div className={styles.revealLabel}><b>más rápido</b><span>nadie escribe un "x" a mano</span></div>
                      </>
                    )}
                  </div>
                </div>

                <div className={styles.actions}>
                  <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => goTo(8)}>Atrás</button>
                  <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => goTo(10)}>Siguiente</button>
                </div>
              </div>
            </motion.div>
          )}

          {s === 10 && questionCard(
            "¿Algo que ajustar o mejorar en el camino?",
            "Opcional. Total sinceridad, esto también lo reviso yo.",
            form.adjustments, (v) => update("adjustments", v), 9, 11
          )}

          {s === 11 && (
            <motion.div key="step11" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <h2 className={styles.cardTitle}>¿Quieres agregar otro resultado medible?</h2>
                  <p className={styles.cardSub}>Algo puntual que no entra en las anteriores. Totalmente opcional.</p>
                </div>
                <div className={styles.yesno}>
                  <button
                    type="button" onClick={() => update("wantsExtraMetric", true)}
                    className={`${styles.yesnoBtn} ${form.wantsExtraMetric ? styles.yesnoBtnActive : ""}`}
                  >
                    Sí, quiero agregar
                  </button>
                  <button
                    type="button" onClick={() => update("wantsExtraMetric", false)}
                    className={`${styles.yesnoBtn} ${!form.wantsExtraMetric ? styles.yesnoBtnActive : ""}`}
                  >
                    No, gracias
                  </button>
                </div>
                {form.wantsExtraMetric && (
                  <div className={styles.row2}>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Qué medís</label>
                      <input type="text" value={form.freeMetricLabel} onChange={(e) => update("freeMetricLabel", e.target.value)} className={styles.input} placeholder="ej. Errores reducidos" />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.fieldLabel}>Valor</label>
                      <input type="text" value={form.freeMetricValue} onChange={(e) => update("freeMetricValue", e.target.value)} className={styles.input} placeholder="ej. -80%" />
                    </div>
                  </div>
                )}
                <div className={styles.actions}>
                  <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => goTo(10)}>Atrás</button>
                  <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => goTo(12)}>Siguiente</button>
                </div>
              </div>
            </motion.div>
          )}

          {s === 12 && (
            <motion.div key="step12" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <h2 className={styles.cardTitle}>Por último, tu valoración</h2>
                </div>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => update("rating", n)} aria-label={`${n} estrellas`} className={`${styles.starBtn} ${n <= form.rating ? styles.starOn : ""}`}>
                      <Star className="h-7 w-7" fill={n <= form.rating ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
                <div className={styles.actions}>
                  <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => goTo(11)} disabled={isSubmitting}>Atrás</button>
                  <button type="button" onClick={handleSubmit} className={`${styles.btn} ${styles.btnPrimary}`} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" style={{ display: "inline", marginRight: 8 }} />}
                    Enviar testimonio
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
