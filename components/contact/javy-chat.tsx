"use client"

import { useState, useEffect, useRef } from "react"
import { Send } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

interface ChatLine {
  id: number
  role: "javy" | "lead"
  text: string
}

interface DeepSeekMessage {
  role: "system" | "user" | "assistant"
  content: string
}

const LINK_PATTERN = /\[(\/(?:projects|laboratory|automations|certificates)\/[a-zA-Z0-9]+)\]/g

function renderWithLinks(text: string) {
  const parts = text.split(LINK_PATTERN)
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-400 underline hover:text-blue-300"
      >
        {part}
      </a>
    ) : (
      part
    ),
  )
}

const CHIP_KEYS = ["app", "automation", "recruiter"] as const
const SERVICES_WITH_GREETING = ["web", "mobile", "automation", "infra"] as const
type ServiceKey = (typeof SERVICES_WITH_GREETING)[number]

interface JavyChatProps {
  initialService?: string
}

export function JavyChat({ initialService }: JavyChatProps) {
  const { t } = useLanguage()

  const [translatedTexts, setTranslatedTexts] = useState({
    windowTitle: "",
    greeting: "",
    inputPlaceholder: "",
    typing: "",
    errorFallback: "",
    chips: [] as { key: string; label: string }[],
  })

  // Cargar traducciones después de la hidratación (mismo patrón que el resto de /contact)
  useEffect(() => {
    const hasContextualGreeting = (SERVICES_WITH_GREETING as readonly string[]).includes(initialService || "")
    const greeting = hasContextualGreeting
      ? String(t(`contact.javy.greetingByService.${initialService as ServiceKey}`))
      : String(t("contact.javy.greeting"))

    setTranslatedTexts({
      windowTitle: String(t("contact.javy.windowTitle")),
      greeting,
      inputPlaceholder: String(t("contact.javy.inputPlaceholder")),
      typing: String(t("contact.javy.typing")),
      errorFallback: String(t("contact.javy.errorFallback")),
      chips: CHIP_KEYS.map((key) => ({ key, label: String(t(`contact.javy.chips.${key}`)) })),
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
      setLines([{ id: 0, role: "javy", text: translatedTexts.greeting }])
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

      setLines((prev) => [...prev, { id: prev.length, role: "javy", text: data.reply }])
      setHistory((prev) => [...prev, { role: "assistant", content: data.reply }])
    } catch (error) {
      console.error("Error al hablar con Javy:", error)
      setLines((prev) => [...prev, { id: prev.length, role: "javy", text: translatedTexts.errorFallback }])
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

      <div ref={scrollRef} className="p-6 space-y-4 h-[450px] overflow-y-auto font-mono text-base leading-relaxed">
        {lines.map((line) => (
          <div key={line.id} className={line.role === "javy" ? "" : "text-slate-400"}>
            <span className={line.role === "javy" ? "text-blue-500" : "text-green-500"}>
              {line.role === "javy" ? "javy>" : "tú>"}
            </span>{" "}
            {renderWithLinks(line.text)}
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
            <span className="text-blue-500">javy&gt;</span> {translatedTexts.typing}
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
