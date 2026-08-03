"use client"

import { useEffect, useMemo, useState } from "react"
import Footer from "@/components/footer"
import { useLanguage } from "@/hooks/use-language"
import { ProjectHeader } from "@/components/projects/project-header"
import { FlowCard } from "@/components/automations/flow-card"

interface AutomationFlow {
  icon: string
  title: string
  description: string
  steps: string[]
  subtype?: string
}

export default function AutomationsPage() {
  const { t } = useLanguage()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const flows = useMemo(() => {
    if (!isMounted) return []
    const items = t("automations.items", { returnObjects: true })
    return Array.isArray(items) ? (items as AutomationFlow[]) : []
  }, [t, isMounted])

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
          <ProjectHeader title={title} description={subtitle} />

          {isMounted && flows.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">{noProjects}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {flows.map((flow, index) => (
                <FlowCard
                  key={flow.icon}
                  icon={flow.icon}
                  title={flow.title}
                  description={flow.description}
                  stepsCount={flow.steps.length}
                  stepsWord={stepsWord}
                  subtype={flow.subtype}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
