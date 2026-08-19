"use client"

import { useState } from "react"
import { useLanguage } from "@/hooks/use-language"
import { ProjectHeader } from "@/components/projects/project-header"
import { FlowCard } from "@/components/automations/flow-card"
import { PaginationControls } from "@/components/pagination-controls"

const PAGE_SIZE = 6

interface RawAutomation {
  _id: string
  slug: string
  title: string
  description: string
  subtype?: string
  automationDetails?: {
    icon?: string
    flow?: { steps?: string[] }
  }
  translations?: {
    en?: { title?: string; description?: string; subtype?: string; steps?: string[] }
    fr?: { title?: string; description?: string; subtype?: string; steps?: string[] }
    it?: { title?: string; description?: string; subtype?: string; steps?: string[] }
  }
}

export function AutomationsListView({ automations }: { automations: RawAutomation[] }) {
  const { language, t } = useLanguage()
  const [page, setPage] = useState(1)

  const title = String(t("automations.title") || "Automatizaciones")
  const subtitle = String(t("automations.subtitle") || "")
  const stepsWord = String(t("automations.stepsWord") || "pasos")
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

          {automations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">{noProjects}</p>
            </div>
          ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {automations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((auto, index) => {
                const translated = auto.translations?.[language.code as "en" | "fr" | "it"]
                const autoTitle = language.code === "es" ? auto.title : translated?.title || auto.title
                const description = language.code === "es" ? auto.description : translated?.description || auto.description
                const subtype = language.code === "es" ? auto.subtype : translated?.subtype || auto.subtype
                const steps =
                  (language.code === "es" ? auto.automationDetails?.flow?.steps : translated?.steps) ||
                  auto.automationDetails?.flow?.steps ||
                  []

                return (
                  <FlowCard
                    key={auto._id}
                    id={auto._id}
                    slug={auto.slug}
                    icon={auto.automationDetails?.icon || ""}
                    title={autoTitle}
                    description={description}
                    stepsCount={steps.length}
                    stepsWord={stepsWord}
                    subtype={subtype}
                    index={index}
                  />
                )
              })}
            </div>
            <PaginationControls
              currentPage={page}
              totalPages={Math.ceil(automations.length / PAGE_SIZE)}
              onPageChange={setPage}
            />
            </>
          )}
        </div>
      </section>
    </main>
  )
}
