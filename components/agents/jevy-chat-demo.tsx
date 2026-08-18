"use client"

import { useEffect, useRef, useState } from "react"
import { Calendar, Check } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

// Demo 100% simulada del chat de Jevy para /agents/[id] (sección Agentes en
// /work). A diferencia del chat real de /contact (components/contact/jevy-chat.tsx),
// esto NUNCA llama a DeepSeek, al motor de matching ni al webhook de agenda —
// es un guion fijo que se reproduce solo. Existe para que cualquiera pueda ver
// cómo razona y responde Jevy sin que cueste tokens reales ni genere una
// reserva/correo/WhatsApp real en producción cada vez que alguien la mira.
// El chat real y con efectos reales sigue viviendo únicamente en /contact.

type ScriptStep =
  | { kind: "lead"; text: string }
  | { kind: "jevy"; text: string }
  | { kind: "widget" }

const SCRIPT: Record<"es" | "en" | "fr" | "it", ScriptStep[]> = {
  es: [
    { kind: "jevy", text: "Cuéntame tu proyecto. ¿Qué quieres construir?" },
    { kind: "lead", text: "Quiero automatizar el agendamiento de citas con mis clientes. Hoy lo hago a mano por WhatsApp y se me duplican horarios." },
    {
      kind: "jevy",
      text: "Buena señal que ya tenés identificado el problema. Dos cosas más para arrancar:\n\n- **Equipo:** ¿lo usarías solo vos o más gente?\n- **Herramientas:** ¿ya tenés Google Calendar o algo así, o arrancamos de cero?",
    },
    { kind: "lead", text: "Solo yo por ahora, y sí, uso Google Calendar." },
    {
      kind: "jevy",
      text: "Justo el Ing. Juan Villegas tiene un sistema parecido corriendo en producción — agenda citas por WhatsApp conectado a Google Calendar de punta a punta, sin doble reserva. Te muestro cómo se vería para vos y de una coordinamos una reunión para definir los detalles.",
    },
    { kind: "lead", text: "Dale, mostrame." },
    { kind: "jevy", text: "Elegí el horario que mejor te quede:" },
    { kind: "widget" },
  ],
  en: [
    { kind: "jevy", text: "Tell me about your project. What do you want to build?" },
    { kind: "lead", text: "I want to automate appointment scheduling with my clients. Right now I do it by hand over WhatsApp and I get double bookings." },
    {
      kind: "jevy",
      text: "Good sign that you already identified the problem. Two more things to start:\n\n- **Team:** would it just be you, or more people?\n- **Tools:** do you already have Google Calendar or something similar, or are we starting from scratch?",
    },
    { kind: "lead", text: "Just me for now, and yes, I use Google Calendar." },
    {
      kind: "jevy",
      text: "The Eng. Juan Villegas actually has a similar system running in production — it books appointments over WhatsApp connected to Google Calendar end to end, with no double booking. Let me show you how it would look, and we can set up a meeting to define the details.",
    },
    { kind: "lead", text: "Sure, show me." },
    { kind: "jevy", text: "Pick whichever time works best for you:" },
    { kind: "widget" },
  ],
  fr: [
    { kind: "jevy", text: "Parle-moi de ton projet. Qu'est-ce que tu veux construire ?" },
    { kind: "lead", text: "Je veux automatiser la prise de rendez-vous avec mes clients. Aujourd'hui je le fais à la main sur WhatsApp et j'ai des doublons." },
    {
      kind: "jevy",
      text: "Bon signe, tu as déjà identifié le problème. Encore deux choses pour démarrer :\n\n- **Équipe :** ce serait juste toi, ou d'autres personnes aussi ?\n- **Outils :** tu as déjà Google Calendar ou équivalent, ou on part de zéro ?",
    },
    { kind: "lead", text: "Juste moi pour l'instant, et oui, j'utilise Google Calendar." },
    {
      kind: "jevy",
      text: "L'Ing. Juan Villegas a justement un système similaire en production — il prend les rendez-vous via WhatsApp connecté à Google Calendar de bout en bout, sans doublon. Je te montre à quoi ça ressemblerait, et on peut organiser une réunion pour définir les détails.",
    },
    { kind: "lead", text: "Vas-y, montre-moi." },
    { kind: "jevy", text: "Choisis le créneau qui te convient le mieux :" },
    { kind: "widget" },
  ],
  it: [
    { kind: "jevy", text: "Raccontami del tuo progetto. Cosa vuoi costruire?" },
    { kind: "lead", text: "Voglio automatizzare la prenotazione degli appuntamenti con i miei clienti. Oggi lo faccio a mano su WhatsApp e mi capitano doppie prenotazioni." },
    {
      kind: "jevy",
      text: "Buon segno che hai già individuato il problema. Ancora due cose per iniziare:\n\n- **Team:** lo useresti solo tu o anche altre persone?\n- **Strumenti:** hai già Google Calendar o simili, o partiamo da zero?",
    },
    { kind: "lead", text: "Solo io per ora, e sì, uso Google Calendar." },
    {
      kind: "jevy",
      text: "L'Ing. Juan Villegas ha proprio un sistema simile in produzione — prenota appuntamenti via WhatsApp collegato a Google Calendar end-to-end, senza doppie prenotazioni. Ti mostro come sarebbe per te, e possiamo organizzare un incontro per definire i dettagli.",
    },
    { kind: "lead", text: "Dai, fammi vedere." },
    { kind: "jevy", text: "Scegli l'orario che preferisci:" },
    { kind: "widget" },
  ],
}

function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

function FormattedText({ text }: { text: string }) {
  const rawLines = text.split("\n")
  const lines: { text: string; gap: boolean }[] = []
  let pendingGap = false
  for (const line of rawLines) {
    if (line.trim() === "") {
      pendingGap = true
      continue
    }
    lines.push({ text: line, gap: pendingGap && lines.length > 0 })
    pendingGap = false
  }
  return (
    <>
      {lines.map((line, i) => (
        <span key={i} className={i === 0 ? "" : "block" + (line.gap ? " mt-2" : "")}>
          {renderInline(line.text)}
        </span>
      ))}
    </>
  )
}

// Días/horas ficticios pero calculados sobre "hoy" para que el calendario de
// ejemplo no se vea con fechas viejas — nunca golpea /api/contact/schedule.
function buildDemoDays() {
  const today = new Date()
  const dayOffsets = [2, 3, 5]
  const hoursByOffset: Record<number, number[]> = { 2: [9, 11, 15], 3: [10, 14], 5: [9, 16] }
  return dayOffsets.map((offset) => {
    const d = new Date(today)
    d.setDate(d.getDate() + offset)
    return { date: d, hours: hoursByOffset[offset] }
  })
}

type WidgetPhase = "loading" | "picking" | "booking" | "success"

function DemoSchedulingWidget({ locale, texts }: { locale: string; texts: { loadingSlots: string; pickDay: string; confirming: string; successTitle: string; successBody: string } }) {
  const [phase, setPhase] = useState<WidgetPhase>("loading")
  const [days] = useState(buildDemoDays)
  const [pickedIndex, setPickedIndex] = useState<{ day: number; hour: number } | null>(null)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("picking"), 900)
    return () => clearTimeout(t1)
  }, [])

  useEffect(() => {
    if (phase !== "picking") return
    const t = setTimeout(() => {
      setPickedIndex({ day: 0, hour: 0 })
      setPhase("booking")
    }, 1600)
    return () => clearTimeout(t)
  }, [phase])

  useEffect(() => {
    if (phase !== "booking") return
    const t = setTimeout(() => setPhase("success"), 1200)
    return () => clearTimeout(t)
  }, [phase])

  if (phase === "loading") {
    return (
      <div className="mt-2 flex items-center gap-2 text-slate-400 text-sm font-mono">
        <Calendar className="h-4 w-4 animate-pulse" />
        {texts.loadingSlots}
      </div>
    )
  }

  if (phase === "success") {
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

  return (
    <div className="mt-2 w-full not-italic font-sans">
      <div className="rounded-lg border border-blue-700/30 bg-black/40 overflow-hidden">
        <div className="px-4 py-3 border-b border-blue-700/20 bg-black/30 text-xs text-slate-500">jevy&gt; agenda</div>
        <div className="p-5">
          <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-4">
            <Calendar className="h-4 w-4" />
            {texts.pickDay}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {days.map((day, di) => (
              <div
                key={di}
                className={
                  "rounded-md border p-3 text-center transition-colors " +
                  (pickedIndex?.day === di ? "border-blue-500 bg-blue-500/10" : "border-blue-700/30")
                }
              >
                <div className="text-sm text-slate-200 capitalize mb-2">
                  {day.date.toLocaleDateString(locale, { day: "numeric", month: "short" })}
                </div>
                <div className="flex flex-col gap-1.5">
                  {day.hours.map((h, hi) => (
                    <span
                      key={h}
                      className={
                        "text-xs rounded px-2 py-1 border " +
                        (pickedIndex?.day === di && pickedIndex?.hour === hi
                          ? "border-blue-400 text-blue-300 bg-blue-500/20"
                          : "border-blue-700/20 text-slate-400")
                      }
                    >
                      {String(h).padStart(2, "0")}:00
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {phase === "booking" && (
            <p className="mt-4 text-xs text-blue-400 animate-pulse">{texts.confirming}</p>
          )}
        </div>
      </div>
    </div>
  )
}

interface DemoLine {
  id: number
  role: "jevy" | "lead"
  text: string
  widget?: boolean
}

export function JevyChatDemo() {
  const { language, t } = useLanguage()
  const localeCode = (language.code as "es" | "en" | "fr" | "it") in SCRIPT ? (language.code as "es" | "en" | "fr" | "it") : "es"
  const script = SCRIPT[localeCode]
  const localeMap: Record<string, string> = { es: "es-VE", en: "en-US", fr: "fr-FR", it: "it-IT" }
  const dateLocale = localeMap[localeCode]

  const [lines, setLines] = useState<DemoLine[]>([])
  const [stepIndex, setStepIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [finished, setFinished] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const texts = {
    windowTitle: String(t("contact.jevy.windowTitle")),
    typing: String(t("contact.jevy.typing")),
    badge: String(t("agents.detail.demoBadge")),
    replay: String(t("agents.detail.demoReplay")),
    scheduling: {
      loadingSlots: String(t("contact.jevy.scheduling.loadingSlots")),
      pickDay: String(t("contact.jevy.scheduling.pickDay")),
      confirming: String(t("contact.jevy.scheduling.confirming")),
      successTitle: String(t("contact.jevy.scheduling.successTitle")),
      successBody: String(t("contact.jevy.scheduling.successBody")),
    },
  }

  const runFrom = (index: number) => {
    if (index >= script.length) {
      setFinished(true)
      return
    }
    const step = script[index]

    if (step.kind === "lead") {
      setLines((prev) => [...prev, { id: prev.length, role: "lead", text: step.text }])
      timerRef.current = setTimeout(() => runFrom(index + 1), 900)
      return
    }

    if (step.kind === "jevy") {
      setIsTyping(true)
      const delay = Math.min(2200, 700 + step.text.length * 12)
      timerRef.current = setTimeout(() => {
        setIsTyping(false)
        setLines((prev) => [...prev, { id: prev.length, role: "jevy", text: step.text }])
        timerRef.current = setTimeout(() => runFrom(index + 1), 500)
      }, delay)
      return
    }

    // widget: se marca en la última línea de jevy para que se renderice debajo.
    // El botón de repetir espera a que el widget termine su propia animación
    // (loading -> picking -> booking -> success, ver DemoSchedulingWidget)
    // para no aparecer mientras todavía se está "reservando".
    setLines((prev) => {
      const next = [...prev]
      if (next.length > 0) next[next.length - 1] = { ...next[next.length - 1], widget: true }
      return next
    })
    timerRef.current = setTimeout(() => setFinished(true), 4000)
  }

  const startDemo = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setLines([])
    setStepIndex((s) => s + 1)
    setFinished(false)
    setIsTyping(false)
    runFrom(0)
  }

  useEffect(() => {
    runFrom(0)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative max-w-none mx-auto rounded-xl overflow-hidden border border-blue-700/30 bg-[#0b0d10] shadow-[0_20px_60px_-25px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-2 px-5 py-3 bg-[#0e1013] border-b border-blue-700/20">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-amber-500" />
        <span className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-2 text-sm text-slate-500 font-mono">{texts.windowTitle}</span>
        <span className="ml-auto text-[10px] uppercase tracking-wide text-amber-400 border border-amber-400/30 rounded-full px-2 py-0.5">
          {texts.badge}
        </span>
      </div>

      <div className="p-6 h-[420px] overflow-y-auto font-mono text-base leading-relaxed">
        <div className="space-y-4" key={stepIndex}>
          {lines.map((line) => (
            <div key={line.id} className={line.role === "jevy" ? "" : "text-slate-400"}>
              <span className={line.role === "jevy" ? "text-blue-500" : "text-green-500"}>
                {line.role === "jevy" ? "jevy>" : "tú>"}
              </span>{" "}
              <FormattedText text={line.text} />
              {line.widget && (
                <DemoSchedulingWidget locale={dateLocale} texts={texts.scheduling} />
              )}
            </div>
          ))}

          {isTyping && (
            <div className="text-blue-500/70">
              <span className="text-blue-500">jevy&gt;</span> {texts.typing}
            </div>
          )}
        </div>
      </div>

      {finished && (
        <div className="flex justify-end px-5 py-3 border-t border-blue-700/20 bg-[#0e1013]">
          <button
            type="button"
            onClick={startDemo}
            className="text-xs px-3 py-1.5 rounded-md border border-blue-600/50 text-blue-400 hover:bg-blue-600/10 transition-colors"
          >
            {texts.replay}
          </button>
        </div>
      )}
    </div>
  )
}
