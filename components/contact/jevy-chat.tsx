"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Send } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

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
}

export function JevyChat({ initialService }: JevyChatProps) {
  const { t } = useLanguage()

  const [translatedTexts, setTranslatedTexts] = useState({
    windowTitle: "",
    greeting: "",
    inputPlaceholder: "",
    typing: "",
    errorFallback: "",
    prototypeBadge: "",
    seeMore: "",
    demo: "",
    chips: [] as { key: string; label: string }[],
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
      prototypeBadge: String(t("contact.jevy.prototypeBadge")),
      seeMore: String(t("projects.seeMore")),
      demo: String(t("projects.demo")),
      chips: CHIP_KEYS.map((key) => ({ key, label: String(t(`contact.jevy.chips.${key}`)) })),
    })
  }, [t, initialService])

  const [lines, setLines] = useState<ChatLine[]>([])
  const [history, setHistory] = useState<DeepSeekMessage[]>([])
  const [input, setInput] = useState("")
  const [chipsVisible, setChipsVisible] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

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

  const pushLeadLine = async (text: string) => {
    if (!text.trim() || isTyping) return
    setLines((prev) => [...prev, { id: prev.length, role: "lead", text }])
    setChipsVisible(false)
    const nextHistory = [...history, { role: "user" as const, content: text }]
    setHistory(nextHistory)
    setIsTyping(true)

    try {
      const response = await fetch("/api/contact/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextHistory, service: initialService }),
      })
      const data = await response.json()

      if (!response.ok || !data.success || !data.reply) {
        throw new Error(data.message || "respuesta vacía")
      }

      setLines((prev) => [...prev, { id: prev.length, role: "jevy", text: data.reply, matches: data.matches }])
      setHistory((prev) => [...prev, { role: "assistant", content: data.reply }])
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

  return (
    <div className="max-w-none mx-auto rounded-xl overflow-hidden border border-blue-700/30 bg-[#0b0d10] shadow-[0_20px_60px_-25px_rgba(0,0,0,0.6)]">
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
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={translatedTexts.inputPlaceholder}
          disabled={isTyping}
          className="flex-1 bg-transparent text-base font-mono text-slate-200 placeholder:text-slate-600 outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          aria-label="send"
          disabled={isTyping}
          className="w-9 h-9 rounded-md bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
