"use client"

import { useState } from "react"
import { useLanguage } from "@/hooks/use-language"
import { ProjectHeader } from "@/components/projects/project-header"
import { AgentCard } from "@/components/agents/agent-card"
import { PaginationControls } from "@/components/pagination-controls"

const PAGE_SIZE = 6

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
    en?: { title?: string; description?: string; subtype?: string; capabilities?: string[] }
    fr?: { title?: string; description?: string; subtype?: string; capabilities?: string[] }
    it?: { title?: string; description?: string; subtype?: string; capabilities?: string[] }
  }
}

export function AgentsListView({ agents }: { agents: RawAgent[] }) {
  const { language, t } = useLanguage()
  const [page, setPage] = useState(1)

  const title = String(t("agents.title") || "Agentes")
  const subtitle = String(t("agents.subtitle") || "")
  const noProjects = String(t("projects.noProjects") || "")

  return (
    <main className="min-h-screen bg-black">
      <section className="pt-32 pb-20 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
          <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-blue-600 to-transparent opacity-20" />
          <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-blue-600 to-transparent opacity-20" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <ProjectHeader title={title} description={subtitle} hideHeader backHref="/work" />

          {agents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">{noProjects}</p>
            </div>
          ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {agents.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((agent, index) => {
                const translated = agent.translations?.[language.code as "en" | "fr" | "it"]
                const agentTitle = language.code === "es" ? agent.title : translated?.title || agent.title
                const description = language.code === "es" ? agent.description : translated?.description || agent.description
                const subtype = language.code === "es" ? agent.subtype : translated?.subtype || agent.subtype
                const capabilities =
                  (language.code === "es" ? agent.agentDetails?.capabilities : translated?.capabilities) ||
                  agent.agentDetails?.capabilities ||
                  []

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
            </>
          )}
        </div>
      </section>
    </main>
  )
}
