"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/hooks/use-language"
import { AgentCard } from "./agent-card"
import { PaginationControls } from "@/components/pagination-controls"

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

const PAGE_SIZE = 6

/**
 * Sección "Agentes" en /work — grilla paginada in-place (mismo patrón que
 * "Proyectos"), sin página de listado aparte: un chat real como el de Jevy no
 * tiene sentido pre-visualizado dos veces, así que la tarjeta manda directo
 * al detalle (`/agents/[slug]`), pero el listado completo vive acá.
 * Recibe: `agents: RawAgent[]` (crudo, del Server Component `/work`).
 * Produce: `null` si no hay agentes; si no, grid de `AgentCard` traducidas + paginación.
 */
export default function Agents({ agents }: AgentsProps) {
  const { language, t } = useLanguage()
  const [page, setPage] = useState(1)

  const title = String(t("agents.title") || "Agentes")
  const subtitle = String(t("agents.subtitle") || "")

  if (agents.length === 0) return null

  const paginatedAgents = agents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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
          {paginatedAgents.map((agent, index) => {
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

        <PaginationControls
          currentPage={page}
          totalPages={Math.ceil(agents.length / PAGE_SIZE)}
          onPageChange={setPage}
        />
      </div>
    </section>
  )
}
