"use client"

import { useEffect, useState } from "react"
import { GitBranch, Check } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { renderInline } from "@/components/common/formatted-text"
import { ScriptedChatDemo, type ScriptStep as ChatStep } from "@/components/agents/scripted-chat-demo"

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

// Ver `ScriptedChatDemo` (components/agents/scripted-chat-demo.tsx) para la
// máquina de estados y los timings — acá solo se arma el guion y el widget.
export function SynapseChatDemo() {
  const { language, t } = useLanguage()
  const localeCode = (language.code as "es" | "en" | "fr" | "it") in SCRIPT ? (language.code as "es" | "en" | "fr" | "it") : "es"

  const gitTexts = {
    syncing: String(t("agents.synapseDemo.syncing")),
    synced: String(t("agents.synapseDemo.synced")),
    commitPrefix: String(t("agents.synapseDemo.commitPrefix")),
  }

  const script: ChatStep[] = SCRIPT[localeCode].map((step) =>
    step.kind === "widget" ? { widget: true } : { from: step.kind === "dev" ? "user" : "bot", text: step.text },
  )

  return (
    <ScriptedChatDemo
      script={script}
      prefixes={{ bot: "synapse>", user: "diego>" }}
      texts={{
        windowTitle: String(t("agents.synapseDemo.windowTitle")),
        typing: String(t("agents.synapseDemo.typing")),
        badge: String(t("agents.detail.demoBadge")),
        replay: String(t("agents.detail.demoReplay")),
      }}
      renderText={(text) => renderInline(text)}
      widget={<GitSyncWidget texts={gitTexts} />}
      widgetFinishDelay={2400}
    />
  )
}
