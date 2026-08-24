"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, Calendar, Check, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

export interface SchedulingData {
  name: string
  email: string
  type: "client" | "recruiter"
  preferredChannel: "email" | "whatsapp"
  channelContact: string
  problem: string
  whatTheyWant: string
  estimatedAmount: string
  expectedTimeline: string
  projectMatch: string
  interestLevel: "high" | "medium" | "low"
  transcript: string
  companyName?: string
  role?: string
  techStack?: string
  modality?: string
  contractType?: string
  selectionProcess?: string
  reportMarkdownUrl: string
  reportPdfUrl: string
  attachmentsZipUrl?: string
  additionalDetailsHtml: string
}

interface Slot {
  startISO: string
  endISO: string
  label: string
}

type Status = "loading" | "picking" | "booking" | "success" | "conflict" | "failed" | "unavailable"
type View = "month" | "day"

/**
 * Widget de agenda embebido en una respuesta del chat de Jevy — calendario en 2 pasos (día → hora).
 * Recibe: `schedulingData` (armado por lib/closing-actions.ts) + `texts` traducidos.
 * Procesa: trae disponibilidad de `/api/contact/schedule` (`action:'availability'`), reserva con `action:'book'`.
 * Produce: estado loading/picking/booking/success/conflict/failed/unavailable según la respuesta del webhook.
 */
interface SchedulingWidgetProps {
  schedulingData: SchedulingData
  texts: {
    loadingSlots: string
    pickDay: string
    pickSlot: string
    back: string
    hourTaken: string
    confirming: string
    successTitle: string
    successBody: string
    conflict: string
    failed: string
    unavailable: string
  }
}

// El horario real vive en n8n (Config: Jevy), acá nunca se hardcodea — el
// rango de horas a mostrar por día se deriva de los slots que ya llegaron.
const LOCALE_MAP: Record<string, string> = { es: "es-VE", en: "en-US", fr: "fr-FR", it: "it-IT" }
const CALENDAR_TZ = "America/Caracas"

// Clave de día y hora en la zona horaria real del negocio, sin importar en
// qué zona esté el navegador del lead (evita que un slot de las 8am en
// Caracas aparezca en el día equivocado para alguien en otro huso horario).
function dayKey(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", { timeZone: CALENDAR_TZ })
}
function slotHour(iso: string): number {
  return Number(new Date(iso).toLocaleString("en-US", { timeZone: CALENDAR_TZ, hour: "numeric", hour12: false }))
}
function pad(n: number): string {
  return String(n).padStart(2, "0")
}

export function SchedulingWidget({ schedulingData, texts }: SchedulingWidgetProps) {
  const { language } = useLanguage()
  const locale = LOCALE_MAP[language.code] || language.code

  const [status, setStatus] = useState<Status>("loading")
  const [slots, setSlots] = useState<Slot[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [view, setView] = useState<View>("month")
  const [cursorMonth, setCursorMonth] = useState<{ year: number; month: number }>(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const fetchSlots = async () => {
    setStatus("loading")
    try {
      const response = await fetch("/api/contact/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "availability" }),
      })
      const data = await response.json()
      if (!response.ok || !Array.isArray(data.slots)) {
        setStatus("unavailable")
        return
      }
      setSlots(data.slots)
      if (data.slots.length) {
        const first = new Date(data.slots[0].startISO)
        const parts = first.toLocaleDateString("en-CA", { timeZone: CALENDAR_TZ }).split("-").map(Number)
        setCursorMonth({ year: parts[0], month: parts[1] - 1 })
      }
      setView("month")
      setSelectedDay(null)
      setStatus("picking")
    } catch {
      setStatus("unavailable")
    }
  }

  useEffect(() => {
    fetchSlots()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const byDay = useMemo(() => {
    const map: Record<string, Slot[]> = {}
    for (const s of slots) {
      const key = dayKey(s.startISO)
      ;(map[key] ||= []).push(s)
    }
    return map
  }, [slots])

  // Rango de horas a mostrar por día, derivado de los slots reales — nunca
  // asumido, así se acomoda solo si el horario laboral cambia del lado de n8n.
  const hourRange = useMemo(() => {
    if (!slots.length) return null
    let min = 23
    let max = 0
    for (const s of slots) {
      const h = slotHour(s.startISO)
      if (h < min) min = h
      if (h > max) max = h
    }
    return { min, max }
  }, [slots])

  const dayKeys = useMemo(() => Object.keys(byDay).sort(), [byDay])
  const minDayKey = dayKeys[0] || null
  const maxDayKey = dayKeys[dayKeys.length - 1] || null

  const pickSlot = async (slot: Slot) => {
    setStatus("booking")
    try {
      const response = await fetch("/api/contact/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "book", ...schedulingData, startISO: slot.startISO, endISO: slot.endISO }),
      })
      const data = await response.json()

      if (response.ok && data.success) {
        setStatus("success")
        return
      }

      if (response.status === 409) {
        setMessage(data.message || null)
        setStatus("conflict")
        await fetchSlots()
        return
      }

      setMessage(data.message || null)
      setStatus("failed")
    } catch {
      setStatus("failed")
    }
  }

  if (status === "loading" || status === "booking") {
    return (
      <div className="mt-2 flex items-center gap-2 text-slate-400 text-sm font-mono">
        <Loader2 className="h-4 w-4 animate-spin" />
        {status === "booking" ? texts.confirming : texts.loadingSlots}
      </div>
    )
  }

  if (status === "unavailable") {
    return (
      <div className="mt-2 flex items-center gap-2 text-amber-400 text-sm font-mono">
        <AlertCircle className="h-4 w-4" />
        {texts.unavailable}
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="mt-2 w-full rounded-lg border border-green-700/30 bg-black/40 p-4 not-italic font-sans">
        <div className="flex items-center gap-2 text-green-400 font-semibold text-sm mb-1">
          <Check className="h-4 w-4" />
          {texts.successTitle}
        </div>
        <p className="text-sm text-slate-300">{texts.successBody}</p>
      </div>
    )
  }

  if (status === "failed") {
    return (
      <div className="mt-2 flex items-start gap-2 text-amber-400 text-sm font-sans not-italic w-full">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <span>{message || texts.failed}</span>
      </div>
    )
  }

  // picking / conflict — calendario en 2 pasos (día -> hora)
  const monthLabel = new Date(cursorMonth.year, cursorMonth.month, 1).toLocaleDateString(locale, { month: "long", year: "numeric" })
  const monthKeyPrefix = `${cursorMonth.year}-${pad(cursorMonth.month + 1)}`
  const atMinMonth = minDayKey !== null && monthKeyPrefix <= minDayKey.slice(0, 7)
  const atMaxMonth = maxDayKey !== null && monthKeyPrefix >= maxDayKey.slice(0, 7)

  const firstWeekday = (new Date(cursorMonth.year, cursorMonth.month, 1).getDay() + 6) % 7 // lunes=0
  const daysInMonth = new Date(cursorMonth.year, cursorMonth.month + 1, 0).getDate()
  const weekdayLabels = ["L", "M", "X", "J", "V", "S", "D"]

  const selectedDaySlots = selectedDay ? byDay[selectedDay] || [] : []
  const selectedDayLabel = selectedDay
    ? new Date(`${selectedDay}T12:00:00`).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })
    : ""
  const selectedDayCrumb = selectedDay
    ? new Date(`${selectedDay}T12:00:00`).toLocaleDateString(locale, { day: "numeric", month: "short" })
    : ""

  return (
    <div className="mt-2 w-full not-italic font-sans">
      {status === "conflict" && (
        <p className="text-amber-400 text-xs mb-2 flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5" />
          {message || texts.conflict}
        </p>
      )}

      <div className="rounded-lg border border-blue-700/30 bg-black/40 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-blue-700/20 bg-black/30 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <button
              type="button"
              disabled={view === "month"}
              onClick={() => setView("month")}
              className={view === "month" ? "text-slate-500 cursor-default" : "text-blue-400 hover:text-blue-300"}
            >
              jevy&gt; agenda
            </button>
            {view === "day" && (
              <>
                <span>›</span>
                <span className="text-slate-300">{selectedDayCrumb}</span>
              </>
            )}
          </div>
          {view === "day" && (
            <button
              type="button"
              onClick={() => setView("month")}
              className="px-2 py-1 rounded-md border border-blue-500 text-blue-400 hover:bg-blue-500/10 transition-colors"
            >
              {texts.back}
            </button>
          )}
        </div>

        <div className="p-5">
          {view === "month" ? (
            <>
              <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-4">
                <Calendar className="h-4 w-4" />
                {texts.pickDay}
              </div>

              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  disabled={atMinMonth}
                  onClick={() => setCursorMonth((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }))}
                  className="w-8 h-8 rounded-md border border-blue-700/30 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:border-blue-500/50 hover:text-blue-400 flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium text-slate-300 capitalize">{monthLabel}</span>
                <button
                  type="button"
                  disabled={atMaxMonth}
                  onClick={() => setCursorMonth((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }))}
                  className="w-8 h-8 rounded-md border border-blue-700/30 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:border-blue-500/50 hover:text-blue-400 flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-2">
                {weekdayLabels.map((w) => (
                  <div key={w} className="text-center text-xs text-slate-600">
                    {w}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: firstWeekday }).map((_, i) => (
                  <div key={`pad-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const key = `${cursorMonth.year}-${pad(cursorMonth.month + 1)}-${pad(day)}`
                  const available = (byDay[key] || []).length > 0
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={!available}
                      onClick={() => {
                        setSelectedDay(key)
                        setView("day")
                      }}
                      className={
                        "relative h-9 rounded-md text-sm flex items-center justify-center transition-colors " +
                        (available
                          ? "bg-blue-500/10 border border-blue-700/30 text-slate-200 hover:border-blue-500/50 cursor-pointer"
                          : "text-slate-700 cursor-not-allowed")
                      }
                    >
                      {day}
                      {available && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-400" />}
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-200 mb-1 capitalize">{selectedDayLabel}</p>
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-4">
                <Calendar className="h-3.5 w-3.5" />
                {texts.pickSlot}
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                {hourRange &&
                  Array.from({ length: hourRange.max - hourRange.min + 1 }).map((_, i) => {
                    const h = hourRange.min + i
                    const slot = selectedDaySlots.find((s) => slotHour(s.startISO) === h)
                    return (
                      <button
                        key={h}
                        type="button"
                        disabled={!slot}
                        onClick={() => slot && pickSlot(slot)}
                        className={
                          "flex flex-col items-center justify-center gap-1 py-3 rounded-md text-xs transition-colors " +
                          (slot
                            ? "border border-blue-700/30 text-slate-300 hover:border-blue-500/50 hover:text-blue-400 cursor-pointer"
                            : "border border-transparent bg-black/30 text-slate-700 cursor-not-allowed")
                        }
                      >
                        <span>{slot ? slot.label.split(", ").pop() : `${pad(h)}:00`}</span>
                        {!slot && <span className="text-[10px] uppercase tracking-wide text-red-400/70">{texts.hourTaken}</span>}
                      </button>
                    )
                  })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
