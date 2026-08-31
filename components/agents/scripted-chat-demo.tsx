"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

/**
 * Demo de chat 100% simulada y genérica: reproduce sola un guion fijo con
 * animación de tipeo y un widget final, botón "repetir" al terminar. NUNCA
 * llama a DeepSeek ni a ningún servicio real.
 *
 * Extraída de `jevy-chat-demo.tsx` y `synapse-chat-demo.tsx` (auditoría
 * 2026-08-27 §4.7 — eran ~90% el mismo archivo). Cada demo concreta se queda
 * como un wrapper fino que arma su `script`, sus `texts`, su `renderText` (Jevy
 * usa `FormattedText` por sus listas multi-línea; Synapse usa `renderInline`) y
 * su `widget`.
 *
 * Timings compartidos (idénticos en ambas demos originales): 900ms tras un turno
 * de usuario, `min(2200, 700 + len*12)`ms de "tipeo" del bot, 500ms entre el
 * mensaje del bot y el siguiente paso. `widgetFinishDelay` sí cambia por demo.
 */

export type ScriptStep = { from: "bot" | "user"; text: string } | { widget: true }

interface ScriptedLine {
  id: number
  from: "bot" | "user"
  text: string
  widget?: boolean
}

interface ScriptedChatDemoProps {
  script: ScriptStep[]
  prefixes: { bot: string; user: string }
  texts: { windowTitle: string; typing: string; badge: string; replay: string }
  renderText: (text: string) => ReactNode
  widget: ReactNode
  widgetFinishDelay: number
}

export function ScriptedChatDemo({
  script,
  prefixes,
  texts,
  renderText,
  widget,
  widgetFinishDelay,
}: ScriptedChatDemoProps) {
  const [lines, setLines] = useState<ScriptedLine[]>([])
  const [stepIndex, setStepIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [finished, setFinished] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const runFrom = (index: number) => {
    if (index >= script.length) {
      setFinished(true)
      return
    }
    const step = script[index]

    if ("widget" in step) {
      setLines((prev) => {
        const next = [...prev]
        if (next.length > 0) next[next.length - 1] = { ...next[next.length - 1], widget: true }
        return next
      })
      timerRef.current = setTimeout(() => setFinished(true), widgetFinishDelay)
      return
    }

    if (step.from === "user") {
      setLines((prev) => [...prev, { id: prev.length, from: "user", text: step.text }])
      timerRef.current = setTimeout(() => runFrom(index + 1), 900)
      return
    }

    setIsTyping(true)
    const delay = Math.min(2200, 700 + step.text.length * 12)
    timerRef.current = setTimeout(() => {
      setIsTyping(false)
      setLines((prev) => [...prev, { id: prev.length, from: "bot", text: step.text }])
      timerRef.current = setTimeout(() => runFrom(index + 1), 500)
    }, delay)
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
            <div key={line.id} className={line.from === "bot" ? "" : "text-slate-400"}>
              <span className={line.from === "bot" ? "text-blue-500" : "text-green-500"}>
                {line.from === "bot" ? prefixes.bot : prefixes.user}
              </span>{" "}
              {renderText(line.text)}
              {line.widget && widget}
            </div>
          ))}

          {isTyping && (
            <div className="text-blue-500/70">
              <span className="text-blue-500">{prefixes.bot}</span> {texts.typing}
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
