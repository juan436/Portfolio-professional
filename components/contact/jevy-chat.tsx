"use client"

import { useState, useEffect, useRef } from "react"
import { Send, Paperclip, Check, Loader2 } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { useTranslatedTexts } from "@/hooks/use-translated-texts"
import { useJevyChatSession } from "@/hooks/use-jevy-chat-session"
import type { UseAttachmentsReturn } from "@/hooks/use-attachments"
import { ACCEPTED_ATTACHMENT_TYPES } from "@/hooks/use-attachments"
import { SchedulingWidget } from "@/components/contact/scheduling-widget"
import { ProjectMatchCard } from "@/components/contact/project-match-card"
import { FormattedText } from "@/components/common/formatted-text"

const CHIP_KEYS = ["app", "automation", "recruiter"] as const
const SERVICES_WITH_GREETING = ["web", "mobile", "automation", "infra"] as const
type ServiceKey = (typeof SERVICES_WITH_GREETING)[number]

/**
 * Chat conversacional de Jevy (`/contact`) — el componente con más estado del sitio.
 * Recibe: `initialService?` (venido de una card de Servicios, saludo/mensaje inicial contextual) + `attachments` (compartido con `AttachmentsCard`).
 * Procesa: persiste la charla en localStorage, timers de inactividad (aviso a los 5min, cierre a los 30s más),
 * manda cada mensaje a `/api/contact/chat` y renderiza matches de proyecto / widget de agenda que vengan en la respuesta.
 * Produce: la ventana de chat completa (historial, chips iniciales, input, drag&drop de adjuntos).
 */
interface JevyChatProps {
  initialService?: string
  referenceProject?: { slug: string; title: string }
  attachments: UseAttachmentsReturn
}

export function JevyChat({ initialService, referenceProject, attachments }: JevyChatProps) {
  const { t, language } = useLanguage()

  const translatedTexts = useTranslatedTexts(
    (t) => {
      const hasContextualGreeting = (SERVICES_WITH_GREETING as readonly string[]).includes(initialService || "")
      const greeting = hasContextualGreeting
        ? String(t(`contact.jevy.greetingByService.${initialService as ServiceKey}`))
        : String(t("contact.jevy.greeting"))

      return {
        windowTitle: String(t("contact.jevy.windowTitle")),
        greeting,
        inputPlaceholder: String(t("contact.jevy.inputPlaceholder")),
        typing: String(t("contact.jevy.typing")),
        errorFallback: String(t("contact.jevy.errorFallback")),
        limitReached: String(t("contact.jevy.limitReached")),
        areYouThere: String(t("contact.jevy.areYouThere")),
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
          pickDay: String(t("contact.jevy.scheduling.pickDay")),
          pickSlot: String(t("contact.jevy.scheduling.pickSlot")),
          back: String(t("contact.jevy.scheduling.back")),
          hourTaken: String(t("contact.jevy.scheduling.hourTaken")),
          confirming: String(t("contact.jevy.scheduling.confirming")),
          successTitle: String(t("contact.jevy.scheduling.successTitle")),
          successBody: String(t("contact.jevy.scheduling.successBody")),
          conflict: String(t("contact.jevy.scheduling.conflict")),
          failed: String(t("contact.jevy.scheduling.failed")),
          unavailable: String(t("contact.jevy.scheduling.unavailable")),
        },
      }
    },
    {
      windowTitle: "",
      greeting: "",
      inputPlaceholder: "",
      typing: "",
      errorFallback: "",
      limitReached: "",
      areYouThere: "",
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
        pickDay: "",
        pickSlot: "",
        back: "",
        hourTaken: "",
        confirming: "",
        successTitle: "",
        successBody: "",
        conflict: "",
        failed: "",
        unavailable: "",
      },
    },
    [initialService]
  )

  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const bottomSentinelRef = useRef<HTMLDivElement>(null)

  const {
    lines,
    history,
    sessionId,
    isClosed,
    chipsVisible,
    sendLeadLine,
    receiveJevyLine,
    receiveJevyError,
    scheduleInactivityWarning,
    clearInactivityTimers,
  } = useJevyChatSession({
    greeting: translatedTexts.greeting,
    areYouThere: translatedTexts.areYouThere,
    localeCode: language.code,
    onReset: () => setInput(""),
  })

  useEffect(() => {
    const scrollEl = scrollRef.current
    const contentEl = contentRef.current
    const sentinelEl = bottomSentinelRef.current
    if (!scrollEl || !contentEl || !sentinelEl) return

    let isNearBottom = true

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isNearBottom = entry.isIntersecting
    }, { root: scrollEl, threshold: 0 })
    intersectionObserver.observe(sentinelEl)

    const resizeObserver = new ResizeObserver(() => {
      if (isNearBottom) scrollEl.scrollTop = scrollEl.scrollHeight
    })
    resizeObserver.observe(contentEl)

    return () => {
      intersectionObserver.disconnect()
      resizeObserver.disconnect()
    }
  }, [])

  const { loadForSession } = attachments
  useEffect(() => {
    loadForSession(sessionId)
  }, [sessionId, loadForSession])

  const pushLeadLine = async (text: string) => {
    if (!text.trim() || isTyping || isClosed) return
    scheduleInactivityWarning()
    const nextHistory = [...history, { role: "user" as const, content: text }]
    sendLeadLine(text)
    setIsTyping(true)

    try {
      const alreadyMatched = lines.some((line) => (line.matches?.length ?? 0) > 0)
      const response = await fetch("/api/contact/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextHistory,
          service: initialService,
          sessionId,
          alreadyMatched,
          locale: language.code,
          ...(referenceProject ? { referenceProjectSlug: referenceProject.slug } : {}),
        }),
      })
      const data = await response.json()

      if (!response.ok || !data.success || (!data.reply && !data.limited)) {
        throw new Error(data.message || "respuesta vacía")
      }

      const replyText = data.limited ? translatedTexts.limitReached : data.reply

      receiveJevyLine({
        text: replyText,
        matches: data.matches,
        schedulingData: data.schedulingData || undefined,
        closed: data.closed,
      })
      if (data.closed) clearInactivityTimers()
    } catch (error) {
      console.error("Error al hablar con Jevy:", error)
      receiveJevyError(translatedTexts.errorFallback)
    } finally {
      setIsTyping(false)
    }
  }

  const autoSentServiceMessageRef = useRef(false)
  useEffect(() => {
    if (autoSentServiceMessageRef.current) return
    if (!initialService || !(SERVICES_WITH_GREETING as readonly string[]).includes(initialService)) return
    if (lines.length !== 1) return
    autoSentServiceMessageRef.current = true
    const defaultMessage = String(t(`contact.jevy.defaultMessageByService.${initialService as ServiceKey}`))
    pushLeadLine(defaultMessage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines.length, initialService, t])

  const autoSentReferenceRef = useRef(false)
  useEffect(() => {
    if (autoSentReferenceRef.current) return
    if (!referenceProject || initialService) return
    if (lines.length !== 1) return
    autoSentReferenceRef.current = true
    const message = String(t("contact.jevy.referenceProjectMessage")).replace("{title}", referenceProject.title)
    pushLeadLine(message)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines.length, referenceProject, initialService, t])

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
      await pushLeadLine(notice)
    }
  }

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    e.target.value = ""
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

      <div ref={scrollRef} className="p-6 h-[620px] overflow-y-auto scroll-smooth font-mono text-base leading-relaxed">
        <div ref={contentRef} className="space-y-4">
          {lines.map((line) => (
            <div key={line.id} className={line.role === "jevy" ? "" : "text-slate-400"}>
              <span className={line.role === "jevy" ? "text-blue-500" : "text-green-500"}>
                {line.role === "jevy" ? "jevy>" : "tú>"}
              </span>{" "}
              <FormattedText text={line.text} />
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
          <div ref={bottomSentinelRef} className="h-px" />
        </div>
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
