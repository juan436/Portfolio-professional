"use client"

import { useEffect, useRef, useState } from "react"
import { GitBranch, Check } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { renderInline } from "@/components/common/formatted-text"

/**
 * Demo 100% simulada del chat de Synapse para /agents/[id]. Guion fijo que se
 * reproduce solo, nunca llama a DeepSeek ni a git real — mismo patrón que
 * JevyChatDemo (components/agents/jevy-chat-demo.tsx). Escenario elegido para
 * demostrar los 3 diferenciadores reales del sistema: responde con contexto
 * real del equipo (no inventa), rechaza una pregunta fuera del permiso del que
 * pregunta (sin importar cómo se la pidan), y confirma una escritura con
 * sincronización automática a git.
 * Recibe: nada (usa `useLanguage` para elegir el guion `SCRIPT[idioma]`).
 * Produce: `SynapseChatDemo`, animación de charla + widget de git-sync simulado, con botón "repetir" al terminar.
 */

type ScriptStep =
  | { kind: "dev"; text: string }
  | { kind: "synapse"; text: string }
  | { kind: "widget" }

const SCRIPT: Record<"es" | "en" | "fr" | "it", ScriptStep[]> = {
  es: [
    { kind: "synapse", text: "Hola Diego. ¿Qué necesitas saber?" },
    { kind: "dev", text: "¿Por qué el equipo eligió Postgres para el módulo de pagos en vez de Mongo?" },
    {
      kind: "synapse",
      text: "Decisión de arquitectura del equipo (03-06-2026): las transacciones de pago necesitan integridad ACID fuerte, ahí Postgres gana. Mongo se queda para catálogo, donde la flexibilidad de esquema importa más que las transacciones.",
    },
    { kind: "dev", text: "¿Y la clave de acceso al panel de Cloudflare?" },
    {
      kind: "synapse",
      text: "Esa pertenece al dominio 'infraestructura' — restringido a gerencia. No puedo mostrártela, sin importar quién pregunte.",
    },
    { kind: "dev", text: "Ok. Anota esto: el timeout del webhook de pagos se subió a 30s." },
    { kind: "synapse", text: "Guardado." },
    { kind: "widget" },
  ],
  en: [
    { kind: "synapse", text: "Hey Diego. What do you need to know?" },
    { kind: "dev", text: "Why did the team pick Postgres for the payments module instead of Mongo?" },
    {
      kind: "synapse",
      text: "Team architecture decision (2026-06-03): payment transactions need strong ACID guarantees, and that's where Postgres wins. Mongo stays for the catalog, where schema flexibility matters more than transactions.",
    },
    { kind: "dev", text: "And the Cloudflare panel access key?" },
    {
      kind: "synapse",
      text: "That one belongs to the 'infrastructure' domain — restricted to management. I can't show it to you, no matter who's asking.",
    },
    { kind: "dev", text: "Ok. Note this down: the payments webhook timeout was bumped to 30s." },
    { kind: "synapse", text: "Saved." },
    { kind: "widget" },
  ],
  fr: [
    { kind: "synapse", text: "Salut Diego. Qu'est-ce que tu as besoin de savoir ?" },
    { kind: "dev", text: "Pourquoi l'équipe a choisi Postgres pour le module de paiements plutôt que Mongo ?" },
    {
      kind: "synapse",
      text: "Décision d'architecture de l'équipe (03-06-2026) : les transactions de paiement ont besoin de fortes garanties ACID, et c'est là que Postgres l'emporte. Mongo reste pour le catalogue, où la flexibilité du schéma compte plus que les transactions.",
    },
    { kind: "dev", text: "Et la clé d'accès au panneau Cloudflare ?" },
    {
      kind: "synapse",
      text: "Celle-là appartient au domaine 'infrastructure' — réservé à la direction. Je ne peux pas te la montrer, peu importe qui demande.",
    },
    { kind: "dev", text: "Ok. Note ça : le timeout du webhook de paiements est passé à 30s." },
    { kind: "synapse", text: "Enregistré." },
    { kind: "widget" },
  ],
  it: [
    { kind: "synapse", text: "Ciao Diego. Cosa ti serve sapere?" },
    { kind: "dev", text: "Perché il team ha scelto Postgres per il modulo pagamenti invece di Mongo?" },
    {
      kind: "synapse",
      text: "Decisione di architettura del team (03-06-2026): le transazioni di pagamento richiedono forti garanzie ACID, e lì Postgres vince. Mongo resta per il catalogo, dove la flessibilità dello schema conta più delle transazioni.",
    },
    { kind: "dev", text: "E la chiave di accesso al pannello Cloudflare?" },
    {
      kind: "synapse",
      text: "Quella appartiene al dominio 'infrastruttura' — riservato al management. Non posso mostrartela, non importa chi lo chieda.",
    },
    { kind: "dev", text: "Ok. Segna questo: il timeout del webhook dei pagamenti è salito a 30s." },
    { kind: "synapse", text: "Salvato." },
    { kind: "widget" },
  ],
}

function GitSyncWidget({ texts }: { texts: { syncing: string; synced: string; commitPrefix: string } }) {
  const [done, setDone] = useState(false)
  const [hash] = useState(() => Math.random().toString(16).slice(2, 9))

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="mt-2 w-full not-italic font-sans">
      <div className="rounded-lg border border-blue-700/30 bg-black/40 p-4 flex items-center gap-2">
        {done ? (
          <>
            <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
            <span className="text-sm text-green-400">
              {texts.synced} — {texts.commitPrefix} {hash}
            </span>
          </>
        ) : (
          <>
            <GitBranch className="h-4 w-4 text-blue-400 animate-pulse flex-shrink-0" />
            <span className="text-sm text-slate-400">{texts.syncing}</span>
          </>
        )}
      </div>
    </div>
  )
}

interface DemoLine {
  id: number
  role: "synapse" | "dev"
  text: string
  widget?: boolean
}

export function SynapseChatDemo() {
  const { language, t } = useLanguage()
  const localeCode = (language.code as "es" | "en" | "fr" | "it") in SCRIPT ? (language.code as "es" | "en" | "fr" | "it") : "es"
  const script = SCRIPT[localeCode]

  const [lines, setLines] = useState<DemoLine[]>([])
  const [stepIndex, setStepIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [finished, setFinished] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const texts = {
    windowTitle: String(t("agents.synapseDemo.windowTitle")),
    typing: String(t("agents.synapseDemo.typing")),
    badge: String(t("agents.detail.demoBadge")),
    replay: String(t("agents.detail.demoReplay")),
    syncing: String(t("agents.synapseDemo.syncing")),
    synced: String(t("agents.synapseDemo.synced")),
    commitPrefix: String(t("agents.synapseDemo.commitPrefix")),
  }

  const runFrom = (index: number) => {
    if (index >= script.length) {
      setFinished(true)
      return
    }
    const step = script[index]

    if (step.kind === "dev") {
      setLines((prev) => [...prev, { id: prev.length, role: "dev", text: step.text }])
      timerRef.current = setTimeout(() => runFrom(index + 1), 900)
      return
    }

    if (step.kind === "synapse") {
      setIsTyping(true)
      const delay = Math.min(2200, 700 + step.text.length * 12)
      timerRef.current = setTimeout(() => {
        setIsTyping(false)
        setLines((prev) => [...prev, { id: prev.length, role: "synapse", text: step.text }])
        timerRef.current = setTimeout(() => runFrom(index + 1), 500)
      }, delay)
      return
    }

    setLines((prev) => {
      const next = [...prev]
      if (next.length > 0) next[next.length - 1] = { ...next[next.length - 1], widget: true }
      return next
    })
    timerRef.current = setTimeout(() => setFinished(true), 2400)
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
            <div key={line.id} className={line.role === "synapse" ? "" : "text-slate-400"}>
              <span className={line.role === "synapse" ? "text-blue-500" : "text-green-500"}>
                {line.role === "synapse" ? "synapse>" : "diego>"}
              </span>{" "}
              {renderInline(line.text)}
              {line.widget && <GitSyncWidget texts={texts} />}
            </div>
          ))}

          {isTyping && (
            <div className="text-blue-500/70">
              <span className="text-blue-500">synapse&gt;</span> {texts.typing}
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
