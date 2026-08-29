"use client"

import { LocalizedLink as Link, useLocale } from "@/components/common/localized-link"
import { useBackNavigation } from "@/hooks/use-back-navigation"
import { Bot, ExternalLink, Radio, Server, Sparkles, Timer, Wrench } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { JevyChatDemo } from "@/components/agents/jevy-chat-demo"
import { SynapseChatDemo } from "@/components/agents/synapse-chat-demo"
import { SynapseIdeExample } from "@/components/agents/synapse-ide-example"
import { ProjectHeader } from "@/components/projects/project-header"
import { agentIconMap } from "@/components/agents/agent-icon-map"
import { DetailPageShell, DetailNotFound } from "@/components/common/detail-page-shell"
import { FadeIn } from "@/components/common/fade-in"
import { SimilarWorkCTA } from "@/components/common/similar-work-cta"
import { ShareRow } from "@/components/common/share-row"
import { SITE_URL } from "@/lib/site-config"

interface RawAgent {
  _id: string
  slug: string
  title: string
  description: string
  subtype?: string
  relatedProject?: { name: string; href: string }
  agentDetails?: {
    icon?: string
    useCase?: string
    capabilities?: string[]
    channels?: string[]
    tools?: string[]
    setupTime?: string
    liveDemo?: "jevy-chat" | "synapse-chat" | "none"
  }
  translations?: {
    en?: LocaleContent
    fr?: LocaleContent
    it?: LocaleContent
  }
}

interface LocaleContent {
  title?: string
  description?: string
  useCase?: string
  capabilities?: string[]
  channels?: string[]
  tools?: string[]
  setupTime?: string
  subtype?: string
}

/**
 * Vista de detalle de un agente (`/agents/[slug]`).
 * Recibe: `agent` (crudo, con traducciones) + `cameFromWork` (si vino desde /work, muestra "ver todos").
 * Produce: qué hace / capacidades / demo en vivo (`JevyChatDemo` si `liveDemo === "jevy-chat"`) / tools+canales+setup / CTA.
 */
interface AgentDetailViewProps {
  agent: RawAgent | null
  cameFromWork: boolean
}

export function AgentDetailView({ agent, cameFromWork }: AgentDetailViewProps) {
  const locale = useLocale()
  const handleBack = useBackNavigation(`/${locale}/work#agents`)
  const { language, t } = useLanguage()

  const whatItDoes = String(t("agents.detail.whatItDoes") || "Qué hace")
  const capabilitiesHeading = String(t("agents.detail.capabilitiesHeading") || "Capacidades")
  const howItWorks = String(t("agents.detail.howItWorks") || "Así trabaja")
  const liveDemoUnavailable = String(t("agents.detail.liveDemoUnavailable") || "")
  const notFoundLabel = String(t("agents.detail.notFound") || "")
  const backToList = String(t("agents.detail.backToList") || "Volver")
  const viewMoreLabel = String(t("agents.viewMore") || "Ver todos los agentes")
  const toolsHeading = String(t("agents.detail.toolsHeading") || "Construido con")
  const channelsHeading = String(t("agents.detail.channelsHeading") || "Canales soportados")
  const setupTimeHeading = String(t("agents.detail.setupTimeHeading") || "Tiempo de puesta en marcha")
  const relatedProjectLabel = String(t("projects.relatedProjectLabel") || "Proyecto relacionado")

  if (!agent) {
    return <DetailNotFound message={notFoundLabel} backHref="/work#agents" backLabel={backToList} />
  }

  const translated = agent.translations?.[language.code as "en" | "fr" | "it"]
  const isEs = language.code === "es"
  const details = agent.agentDetails

  const title = isEs ? agent.title : translated?.title || agent.title
  const description = isEs ? agent.description : translated?.description || agent.description
  const subtype = isEs ? agent.subtype : translated?.subtype || agent.subtype
  const useCase = (isEs ? details?.useCase : translated?.useCase) || details?.useCase
  const capabilities = (isEs ? details?.capabilities : translated?.capabilities) || details?.capabilities || []
  const tools = (isEs ? details?.tools : translated?.tools) || details?.tools || []
  const channels = (isEs ? details?.channels : translated?.channels) || details?.channels || []
  const setupTime = (isEs ? details?.setupTime : translated?.setupTime) || details?.setupTime

  const Icon = agentIconMap[details?.icon || ""] || Bot

  return (
    <DetailPageShell>
          <ProjectHeader
            title={title}
            description={description}
            nav={{
              viewMoreHref: cameFromWork ? "/work#agents" : undefined,
              viewMoreLabel: cameFromWork ? viewMoreLabel : undefined,
            }}
            subtype={subtype}
            hideHeader
            onBackClick={handleBack}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16 max-w-6xl mx-auto">
            <FadeIn className="bg-zinc-900/40 border border-white/10 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Icon className="h-6 w-6 text-blue-500" />
                </div>
                <h2 className="text-lg font-bold text-blue-400 uppercase tracking-wide">
                  {whatItDoes}
                </h2>
              </div>
              <p className="text-slate-300 leading-relaxed text-base whitespace-pre-line">{useCase || description}</p>
            </FadeIn>

            <FadeIn delay={0.1} className="bg-zinc-900/40 border border-white/10 rounded-xl p-8">
              <h2 className="text-lg font-bold text-blue-400 uppercase tracking-wide mb-4">
                {capabilitiesHeading}
              </h2>
              <ul className="space-y-2">
                {capabilities.map((capability, i) => (
                  <li key={i} className="flex items-start gap-2 text-base text-slate-400">
                    <Sparkles className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    {capability}
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>

          <FadeIn className="w-full mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">{howItWorks}</h2>
            {details?.liveDemo === "jevy-chat" ? (
              <div className="max-w-3xl mx-auto">
                <JevyChatDemo />
              </div>
            ) : details?.liveDemo === "synapse-chat" ? (
              <div className="max-w-3xl mx-auto space-y-10">
                <SynapseChatDemo />
                <SynapseIdeExample />
              </div>
            ) : (
              <p className="text-center text-slate-500 text-sm">{liveDemoUnavailable}</p>
            )}
          </FadeIn>

          {(tools.length > 0 || channels.length > 0 || setupTime || agent.relatedProject) && (
            <FadeIn className="flex flex-wrap items-stretch justify-center gap-4 max-w-6xl mx-auto mb-16">
              {tools.length > 0 && (
                <div className="min-w-[180px] max-w-[300px] text-left p-4 rounded-xl bg-zinc-900/40 border border-white/5">
                  <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-2">
                    <Wrench className="h-3.5 w-3.5 text-blue-500" />
                    {toolsHeading}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tools.map((tool) => (
                      <span
                        key={tool}
                        className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-tighter"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {channels.length > 0 && (
                <div className="min-w-[180px] max-w-[220px] text-left p-4 rounded-xl bg-zinc-900/40 border border-white/5">
                  <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-2">
                    <Radio className="h-3.5 w-3.5 text-blue-500" />
                    {channelsHeading}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {channels.map((channel) => (
                      <span
                        key={channel}
                        className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-tighter"
                      >
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {setupTime && (
                <div className="min-w-[180px] max-w-[220px] text-left p-4 rounded-xl bg-zinc-900/40 border border-white/5">
                  <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                    <Timer className="h-3.5 w-3.5 text-blue-500" />
                    {setupTimeHeading}
                  </p>
                  <p className="text-sm text-slate-300 break-words">{setupTime}</p>
                </div>
              )}
              {agent.relatedProject && (
                <Link
                  href={agent.relatedProject.href}
                  className="min-w-[180px] max-w-[220px] text-left p-4 rounded-xl bg-zinc-900/40 border border-white/5 hover:border-blue-500/40 transition-colors"
                >
                  <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">
                    <Server className="h-3.5 w-3.5 text-blue-500" />
                    {relatedProjectLabel}
                  </p>
                  <p className="text-sm text-blue-400 break-words inline-flex items-center gap-1">
                    {agent.relatedProject.name}
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </p>
                </Link>
              )}
            </FadeIn>
          )}

          <ShareRow url={`${SITE_URL}/${locale}/agents/${agent.slug}`} />
          <SimilarWorkCTA reference={{ slug: agent.slug, title }} />
    </DetailPageShell>
  )
}
