"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useLanguage } from "@/hooks/use-language"
import { ArrowRight } from "lucide-react"
import { AgentCard } from "./agent-card"

interface RawAgent {
  _id: string
  slug: string
  title: string
  description: string
  subtype?: string
  agentDetails?: {
    icon?: string
    capabilities?: string[]
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
  subtype?: string
  capabilities?: string[]
}

interface AgentsProps {
  agents: RawAgent[]
}

/**
 * Sección "Agentes" en /work — grilla simple (no carrusel con demo embebida como
 * Automatizaciones): un chat real como el de Jevy no tiene sentido pre-visualizado
 * dos veces (acá y en /agents/[id]), así que la tarjeta manda directo al detalle.
 * Recibe: `agents: RawAgent[]` (crudo, del Server Component `/work`).
 * Produce: `null` si no hay agentes; si no, grid de `AgentCard` traducidas + link "ver todos".
 */
export default function Agents({ agents }: AgentsProps) {
  const { language, t } = useLanguage()

  const title = String(t("agents.title") || "Agentes")
  const subtitle = String(t("agents.subtitle") || "")
  const viewMore = String(t("agents.viewMore") || "Ver todos los agentes")

  if (agents.length === 0) return null

  return (
    <section id="agents" className="py-24 bg-black relative overflow-hidden">
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-3"
          >
            <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 shrink-0">03</span>
            <div className="h-px flex-1 bg-gradient-to-r from-blue-600/50 to-transparent" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 shrink-0">
              {title} · {agents.length}
            </span>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-slate-500 text-sm max-w-xl"
          >
            {subtitle}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map((agent, index) => {
            const translated = agent.translations?.[language.code as "en" | "fr" | "it"]
            const isEs = language.code === "es"
            const details = agent.agentDetails

            const agentTitle = isEs ? agent.title : translated?.title || agent.title
            const description = isEs ? agent.description : translated?.description || agent.description
            const subtype = isEs ? agent.subtype : translated?.subtype || agent.subtype
            const capabilities = (isEs ? details?.capabilities : translated?.capabilities) || details?.capabilities || []

            return (
              <AgentCard
                key={agent._id}
                id={agent._id}
                slug={agent.slug}
                title={agentTitle}
                description={description}
                capabilities={capabilities}
                subtype={subtype}
                index={index}
              />
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-12 flex justify-center"
        >
          <Link
            href="/agents"
            className="group inline-flex items-center border border-blue-700/50 text-blue-500 hover:bg-blue-700/10 hover:border-blue-500 transition-all duration-300 rounded-md px-4 py-2 text-sm font-medium"
          >
            {viewMore}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
