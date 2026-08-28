"use client"

import { useEffect, useState } from "react"
import { X, Loader2, Check, AlertTriangle } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { useContent } from "@/contexts/content"
import { fetchProjects } from "@/services/api/projects"
import { fetchTestimonials } from "@/services/api/testimonials"
import type { UseAttachmentsReturn } from "@/hooks/use-attachments"
import { WHATSAPP_NUMBER } from "@/utils/social-links"

interface PanelTexts {
  aboutBadge: string
  aboutText: string
  statsHeading: string
  projectsSuffix: string
  ratingSuffix: string
  stepsHeading: string
  step1: string
  step2: string
  step3: string
  step4: string
  fallbackHeading: string
  fallbackText: string
  fallbackWhatsappLabel: string
}

function usePanelTexts(): PanelTexts {
  const { t } = useLanguage()
  return {
    aboutBadge: String(t("contact.jevy.about.badge")),
    aboutText: String(t("contact.jevy.about.text")),
    statsHeading: String(t("contact.jevy.stats.heading")),
    projectsSuffix: String(t("contact.jevy.stats.projectsSuffix")),
    ratingSuffix: String(t("contact.jevy.stats.ratingSuffix")),
    stepsHeading: String(t("contact.jevy.steps.heading")),
    step1: String(t("contact.jevy.steps.step1")),
    step2: String(t("contact.jevy.steps.step2")),
    step3: String(t("contact.jevy.steps.step3")),
    step4: String(t("contact.jevy.steps.step4")),
    fallbackHeading: String(t("contact.jevy.fallback.heading")),
    fallbackText: String(t("contact.jevy.fallback.text")),
    fallbackWhatsappLabel: String(t("contact.jevy.fallback.whatsappLabel")),
  }
}

function useRealStats() {
  const [projectCount, setProjectCount] = useState<number | null>(null)
  const [avgRating, setAvgRating] = useState<number | null>(null)
  const [testimonialCount, setTestimonialCount] = useState<number | null>(null)

  useEffect(() => {
    fetchProjects().then((projects: { category: string }[]) => {
      const delivered = projects.filter((p) => p.category !== "laboratory")
      setProjectCount(delivered.length)
    })
    fetchTestimonials().then((testimonials) => {
      const rated = testimonials.filter((t) => typeof t.rating === "number")
      if (rated.length > 0) {
        setAvgRating(rated.reduce((sum, t) => sum + (t.rating || 0), 0) / rated.length)
      }
      setTestimonialCount(testimonials.length)
    })
  }, [])

  return { projectCount, avgRating, testimonialCount }
}

/**
 * Panel "sobre Jevy" (columna izquierda de /contact) — estadísticas reales de proyectos/testimonios.
 * Recibe: nada (fetch propio).
 * Produce: badge + stats (cantidad de proyectos entregados, rating promedio).
 */
export function JevyAboutPanel() {
  const texts = usePanelTexts()
  const { projectCount, avgRating, testimonialCount } = useRealStats()

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-blue-700/15 bg-black/30 p-4 text-sm leading-relaxed">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_theme(colors.green.500)]" />
          <span className="font-mono text-[0.7rem] uppercase tracking-wider text-blue-400">{texts.aboutBadge}</span>
        </div>
        <p className="text-slate-400">{texts.aboutText}</p>
      </div>

      {(projectCount !== null || avgRating !== null) && (
        <div className="rounded-lg border border-blue-700/15 bg-black/30 p-4 font-mono">
          <div className="text-[0.7rem] uppercase tracking-wider text-blue-400 mb-3">{texts.statsHeading}</div>
          <div className="flex flex-col gap-2">
            {projectCount !== null && (
              <div className="flex items-baseline justify-between">
                <span className="text-blue-400 font-extrabold text-lg">{projectCount}</span>
                <span className="text-slate-500 text-[0.7rem] uppercase tracking-wide">{texts.projectsSuffix}</span>
              </div>
            )}
            {avgRating !== null && (
              <div className="flex items-baseline justify-between">
                <span className="text-blue-400 font-extrabold text-lg">{avgRating.toFixed(1)}★</span>
                <span className="text-slate-500 text-[0.7rem] uppercase tracking-wide">
                  {testimonialCount ? `${testimonialCount} ${texts.ratingSuffix}` : texts.ratingSuffix}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Panel "cómo funciona" (columna derecha de /contact) — pasos del flujo + fallback de contacto directo.
 * Recibe: nada (lee `content.contact.email` del `ContentProvider`).
 * Produce: lista de pasos numerados + email/WhatsApp si `content` no llegó a tiempo.
 */
export function JevyGuidePanel() {
  const texts = usePanelTexts()
  const { content } = useContent()
  const email = content?.contact?.email

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-blue-700/15 bg-black/30 p-4">
        <div className="font-mono text-[0.7rem] uppercase tracking-wider text-blue-400 mb-3">{texts.stepsHeading}</div>
        <ol className="flex flex-col gap-3">
          {[texts.step1, texts.step2, texts.step3, texts.step4].map((step, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
              <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border border-blue-700/30 bg-blue-500/10 text-blue-400 font-mono text-[0.65rem] font-bold flex items-center justify-center">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {(email || WHATSAPP_NUMBER) && (
        <div className="rounded-lg border border-blue-700/15 bg-black/30 p-4 text-sm">
          <div className="font-mono text-[0.7rem] uppercase tracking-wider text-blue-400 mb-2">{texts.fallbackHeading}</div>
          <p className="text-slate-400 mb-2">{texts.fallbackText}</p>
          <div className="flex flex-col gap-1.5">
            {email && (
              <a href={`mailto:${email}`} className="font-mono text-[0.85rem] text-blue-300 border-b border-dashed border-blue-700/40 hover:text-blue-200 transition-colors w-fit">
                {email}
              </a>
            )}
            {WHATSAPP_NUMBER && (
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[0.85rem] text-blue-300 border-b border-dashed border-blue-700/40 hover:text-blue-200 transition-colors w-fit"
              >
                {texts.fallbackWhatsappLabel}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function fileExtLabel(filename: string) {
  const ext = filename.split(".").pop() || ""
  return ext.slice(0, 3).toUpperCase()
}

interface AttachmentsTexts {
  title: string
  empty: string
  filesSuffix: string
  viewHint: string
  modalTitle: string
  processed: string
  pending: string
  failed: string
}

function useAttachmentsTexts(): AttachmentsTexts {
  const { t } = useLanguage()
  const [texts, setTexts] = useState<AttachmentsTexts>({
    title: "",
    empty: "",
    filesSuffix: "",
    viewHint: "",
    modalTitle: "",
    processed: "",
    pending: "",
    failed: "",
  })

  useEffect(() => {
    setTexts({
      title: String(t("contact.jevy.attachmentsCard.title")),
      empty: String(t("contact.jevy.attachmentsCard.empty")),
      filesSuffix: String(t("contact.jevy.attachmentsCard.filesSuffix")),
      viewHint: String(t("contact.jevy.attachmentsCard.viewHint")),
      modalTitle: String(t("contact.jevy.attachmentsCard.modalTitle")),
      processed: String(t("contact.jevy.attachmentsCard.processed")),
      pending: String(t("contact.jevy.attachmentsCard.pending")),
      failed: String(t("contact.jevy.attachmentsCard.failed")),
    })
  }, [t])

  return texts
}

/**
 * Card de adjuntos (columna izquierda de /contact) — vista compacta + modal con el detalle de cada archivo.
 * Recibe: `attachments: UseAttachmentsReturn` (estado compartido con `JevyChat`, ver hooks/use-attachments.ts).
 * Produce: preview apilado de hasta 3 archivos + modal con estado processed/pending/failed por archivo.
 */
export function AttachmentsCard({ attachments }: { attachments: UseAttachmentsReturn }) {
  const texts = useAttachmentsTexts()
  const [modalOpen, setModalOpen] = useState(false)
  const count = attachments.attachedFiles.length

  return (
    <>
      <div
        className={`rounded-lg border border-blue-700/15 bg-black/30 p-4 transition-colors ${count > 0 ? "cursor-pointer hover:border-blue-700/30" : ""}`}
        onClick={() => count > 0 && setModalOpen(true)}
        role={count > 0 ? "button" : undefined}
        tabIndex={count > 0 ? 0 : undefined}
        onKeyDown={(e) => {
          if (count > 0 && (e.key === "Enter" || e.key === " ")) setModalOpen(true)
        }}
      >
        <div className="font-mono text-[0.7rem] uppercase tracking-wider text-blue-400 mb-3">{texts.title}</div>

        {count === 0 ? (
          <div className="h-[70px] flex items-center justify-center rounded-md border border-dashed border-blue-700/20 text-slate-600 font-mono text-[0.65rem] text-center px-2">
            {texts.empty}
          </div>
        ) : (
          <>
            <div className="h-[70px] relative flex items-center justify-center">
              {attachments.attachedFiles.slice(0, 3).map((file, i) => (
                <div
                  key={file.name}
                  className="absolute w-[54px] h-[70px] rounded border border-blue-700/30 bg-[#0e1013] flex items-end p-1.5 font-mono text-[0.55rem] text-slate-500"
                  style={{
                    transform: `rotate(${[-9, 4, -2][i]}deg) translateX(${[-18, 4, 20][i]}px)`,
                    zIndex: i + 1,
                    borderColor: i === 2 ? "rgba(29,78,216,0.5)" : undefined,
                  }}
                >
                  .{fileExtLabel(file.name).toLowerCase()}
                </div>
              ))}
            </div>
            <div className="text-center font-mono text-[0.65rem] text-slate-500 mt-3">
              <span className="text-blue-400 font-bold">{count}</span> {texts.filesSuffix} — {texts.viewHint}
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-xl border border-blue-700/30 bg-[#0b0d10] shadow-[0_20px_60px_-25px_rgba(0,0,0,0.7)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-[#0e1013] border-b border-blue-700/20">
              <span className="font-mono text-sm uppercase tracking-wider text-blue-400">{texts.modalTitle}</span>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="close"
                className="text-slate-500 hover:text-red-400 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col h-[420px] overflow-y-auto">
              {attachments.attachedFiles.map((file) => {
                const result = attachments.attachmentResults.find((r) => r.filename === file.name)
                const failed = Boolean(result?.error)
                const done = Boolean(result?.markdown)
                return (
                  <div key={file.name} className="flex items-center gap-4 px-6 py-4 border-b border-blue-700/10 last:border-b-0">
                    <span className="w-10 h-12 shrink-0 rounded border border-blue-700/30 bg-[#0e1013] flex items-center justify-center font-mono text-xs font-bold text-blue-300">
                      {fileExtLabel(file.name)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-base text-slate-300 truncate">{file.name}</div>
                      <div className={`font-mono text-xs mt-1 flex items-center gap-1.5 ${failed ? "text-red-400" : done ? "text-green-500" : "text-slate-500"}`}>
                        {failed && <AlertTriangle className="h-3.5 w-3.5" />}
                        {done && <Check className="h-3.5 w-3.5" />}
                        {!result && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {failed ? texts.failed : done ? texts.processed : texts.pending}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
