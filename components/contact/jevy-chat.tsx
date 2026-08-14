"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Send, Paperclip, Check, Loader2 } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import type { UseAttachmentsReturn } from "@/hooks/use-attachments"
import { ACCEPTED_ATTACHMENT_TYPES } from "@/hooks/use-attachments"
import { SchedulingWidget, type SchedulingData } from "@/components/contact/scheduling-widget"

interface ProjectMatch {
  id: string
  title: string
  image: string | null
  path: string
  demo: string | null
  isPrototype: boolean
}

interface ChatLine {
  id: number
  role: "jevy" | "lead"
  text: string
  matches?: ProjectMatch[]
  schedulingData?: SchedulingData
}

interface DeepSeekMessage {
  role: "system" | "user" | "assistant"
  content: string
}

function ProjectMatchCard({ match, prototypeLabel, seeMoreLabel, demoLabel }: {
  match: ProjectMatch
  prototypeLabel: string
  seeMoreLabel: string
  demoLabel: string
}) {
  return (
    <div className="mt-2 max-w-sm rounded-lg border border-blue-700/30 bg-black/40 overflow-hidden not-italic font-sans">
      {match.image && (
        <div className="relative w-full h-32">
          <Image src={match.image} alt={match.title} fill className="object-cover" />
        </div>
      )}
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-200">{match.title}</span>
        </div>
        {match.isPrototype && (
          <span className="inline-block text-[10px] uppercase tracking-wide text-amber-400 border border-amber-400/30 rounded-full px-2 py-0.5">
            {prototypeLabel}
          </span>
        )}
        <div className="flex gap-2 pt-1">
          <a
            href={match.path}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            {seeMoreLabel}
          </a>
          {match.demo && (
            <a
              href={match.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-md border border-blue-600/50 text-blue-400 hover:bg-blue-600/10 transition-colors"
            >
              {demoLabel}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

const CHIP_KEYS = ["app", "automation", "recruiter"] as const
const SERVICES_WITH_GREETING = ["web", "mobile", "automation", "infra"] as const
type ServiceKey = (typeof SERVICES_WITH_GREETING)[number]

interface JevyChatProps {
  initialService?: string
  attachments: UseAttachmentsReturn
}

export function JevyChat({ initialService, attachments }: JevyChatProps) {
  const { t } = useLanguage()

  const [translatedTexts, setTranslatedTexts] = useState({
    windowTitle: "",
    greeting: "",
    inputPlaceholder: "",
    typing: "",
    errorFallback: "",
    attachTooltip: "",
    attachTooLarge: "",
    attachError: "",
    attachedNotice: "",
    dropHint: "",
    prototypeBadge: "",
    seeMore: "",
    demo: "",
    chips: [] as { key: string; label: string }[],
    scheduling: {
      loadingSlots: "",
      pickSlot: "",
      confirming: "",
      successTitle: "",
      successBody: "",
      conflict: "",
      failed: "",
      unavailable: "",
    },
  })

  // Cargar traducciones después de la hidratación (mismo patrón que el resto de /contact)
  useEffect(() => {
    const hasContextualGreeting = (SERVICES_WITH_GREETING as readonly string[]).includes(initialService || "")
    const greeting = hasContextualGreeting
      ? String(t(`contact.jevy.greetingByService.${initialService as ServiceKey}`))
      : String(t("contact.jevy.greeting"))

    setTranslatedTexts({
      windowTitle: String(t("contact.jevy.windowTitle")),
      greeting,
      inputPlaceholder: String(t("contact.jevy.inputPlaceholder")),
      typing: String(t("contact.jevy.typing")),
      errorFallback: String(t("contact.jevy.errorFallback")),
      attachTooltip: String(t("contact.jevy.attachTooltip")),
      attachTooLarge: String(t("contact.jevy.attachTooLarge")),
      attachError: String(t("contact.jevy.attachError")),
      attachedNotice: String(t("contact.jevy.attachedNotice")),
      dropHint: String(t("contact.jevy.dropHint")),
      prototypeBadge: String(t("contact.jevy.prototypeBadge")),
      seeMore: String(t("common.seeMore")),
      demo: String(t("projects.demo")),
      chips: CHIP_KEYS.map((key) => ({ key, label: String(t(`contact.jevy.chips.${key}`)) })),
      scheduling: {
        loadingSlots: String(t("contact.jevy.scheduling.loadingSlots")),
        pickSlot: String(t("contact.jevy.scheduling.pickSlot")),
        confirming: String(t("contact.jevy.scheduling.confirming")),
        successTitle: String(t("contact.jevy.scheduling.successTitle")),
        successBody: String(t("contact.jevy.scheduling.successBody")),
        conflict: String(t("contact.jevy.scheduling.conflict")),
        failed: String(t("contact.jevy.scheduling.failed")),
        unavailable: String(t("contact.jevy.scheduling.unavailable")),
      },
    })
  }, [t, initialService])

  const [lines, setLines] = useState<ChatLine[]>([])
  const [history, setHistory] = useState<DeepSeekMessage[]>([])
  const [input, setInput] = useState("")
  const [chipsVisible, setChipsVisible] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [isClosed, setIsClosed] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  // Un id por charla — agrupa los adjuntos guardados en disco y evita
  // guardar el Lead/JobOffer más de una vez al cerrar.
  const [sessionId] = useState(() => crypto.randomUUID())

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [lines, isTyping, chipsVisible])

  // Arranca la conversación en cuanto el saludo traducido está listo (solo una vez)
  useEffect(() => {
    if (translatedTexts.greeting && lines.length === 0) {
      setLines([{ id: 0, role: "jevy", text: translatedTexts.greeting }])
      setHistory([{ role: "assistant", content: translatedTexts.greeting }])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translatedTexts.greeting])

  const pushLeadLine = async (text: string, contextOverride?: string) => {
    if (!text.trim() || isTyping || isClosed) return
    setLines((prev) => [...prev, { id: prev.length, role: "lead", text }])
    setChipsVisible(false)
    const nextHistory = [...history, { role: "user" as const, content: text }]
    setHistory(nextHistory)
    setIsTyping(true)

    try {
      const attachmentsContext = contextOverride ?? attachments.buildAttachmentsContext()
      const response = await fetch("/api/contact/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextHistory,
          service: initialService,
          sessionId,
          ...(attachmentsContext ? { attachmentsContext } : {}),
        }),
      })
      const data = await response.json()

      if (!response.ok || !data.success || !data.reply) {
        throw new Error(data.message || "respuesta vacía")
      }

      setLines((prev) => [
        ...prev,
        { id: prev.length, role: "jevy", text: data.reply, matches: data.matches, schedulingData: data.schedulingData || undefined },
      ])
      setHistory((prev) => [...prev, { role: "assistant", content: data.reply }])
      if (data.closed) setIsClosed(true)
    } catch (error) {
      console.error("Error al hablar con Jevy:", error)
      setLines((prev) => [...prev, { id: prev.length, role: "jevy", text: translatedTexts.errorFallback }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleChipClick = (label: string) => {
    pushLeadLine(label)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    pushLeadLine(input)
    setInput("")
  }

  const processFiles = async (files: File[]) => {
    const processed = await attachments.handleFileSelect(files, sessionId)
    if (processed) {
      const notice = `${translatedTexts.attachedNotice}: ${processed.succeeded.map((r) => r.filename).join(", ")}`
      await pushLeadLine(notice, processed.mergedContext)
    }
  }

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    e.target.value = "" // permite volver a elegir el mismo archivo si se saca y se vuelve a adjuntar
    await processFiles(selected)
  }

  const [isDraggingOver, setIsDraggingOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!isDraggingOver) setIsDraggingOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    setIsDraggingOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(false)
    const dropped = Array.from(e.dataTransfer.files || [])
    await processFiles(dropped)
  }

  const hasProcessedAttachment = attachments.attachmentResults.some((r) => r.markdown)

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative max-w-none mx-auto rounded-xl overflow-hidden border bg-[#0b0d10] shadow-[0_20px_60px_-25px_rgba(0,0,0,0.6)] transition-colors ${
        isDraggingOver ? "border-blue-500" : "border-blue-700/30"
      }`}
    >
      {isDraggingOver && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-blue-950/70 backdrop-blur-[1px] pointer-events-none">
          <span className="font-mono text-sm text-blue-300 border border-blue-500/50 rounded-md px-4 py-2 bg-black/40">
            {translatedTexts.dropHint}
          </span>
        </div>
      )}
      <div className="flex items-center gap-2 px-5 py-3 bg-[#0e1013] border-b border-blue-700/20">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-amber-500" />
        <span className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-2 text-sm text-slate-500 font-mono">{translatedTexts.windowTitle}</span>
      </div>

      <div ref={scrollRef} className="p-6 space-y-4 h-[500px] overflow-y-auto font-mono text-base leading-relaxed">
        {lines.map((line) => (
          <div key={line.id} className={line.role === "jevy" ? "" : "text-slate-400"}>
            <span className={line.role === "jevy" ? "text-blue-500" : "text-green-500"}>
              {line.role === "jevy" ? "jevy>" : "tú>"}
            </span>{" "}
            {line.text}
            {line.matches?.map((match) => (
              <ProjectMatchCard
                key={match.id}
                match={match}
                prototypeLabel={translatedTexts.prototypeBadge}
                seeMoreLabel={translatedTexts.seeMore}
                demoLabel={translatedTexts.demo}
              />
            ))}
            {line.schedulingData && (
              <SchedulingWidget schedulingData={line.schedulingData} texts={translatedTexts.scheduling} />
            )}
          </div>
        ))}

        {chipsVisible && !isTyping && (
          <div className="flex flex-col items-start gap-2 pt-1">
            {translatedTexts.chips.map((chip, i) => (
              <button
                key={chip.key}
                onClick={() => handleChipClick(chip.label)}
                className="text-left text-slate-300 hover:text-blue-400 transition-colors"
              >
                <span className="text-green-500 mr-2">[{i + 1}]</span>
                {chip.label}
              </button>
            ))}
          </div>
        )}

        {isTyping && (
          <div className="text-blue-500/70">
            <span className="text-blue-500">jevy&gt;</span> {translatedTexts.typing}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-3 px-5 py-3 border-t border-blue-700/20 bg-[#0e1013]">
        <input
          ref={attachments.fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_ATTACHMENT_TYPES}
          onChange={handleFileInputChange}
          className="hidden"
        />
        <button
          type="button"
          aria-label={translatedTexts.attachTooltip}
          title={translatedTexts.attachTooltip}
          disabled={isTyping || isClosed || attachments.isUploadingAttachment}
          onClick={() => attachments.fileInputRef.current?.click()}
          className="relative w-9 h-9 shrink-0 rounded-md border border-blue-700/30 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:border-blue-500/50 transition-colors disabled:opacity-50"
        >
          {attachments.isUploadingAttachment ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Paperclip className="h-4 w-4" />
          )}
          {hasProcessedAttachment && !attachments.isUploadingAttachment && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border border-[#0e1013] flex items-center justify-center">
              <Check className="h-2.5 w-2.5 text-[#0e1013]" strokeWidth={3} />
            </span>
          )}
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={translatedTexts.inputPlaceholder}
          disabled={isTyping || isClosed}
          className="flex-1 bg-transparent text-base font-mono text-slate-200 placeholder:text-slate-600 outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          aria-label="send"
          disabled={isTyping || isClosed}
          className="w-9 h-9 rounded-md bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
