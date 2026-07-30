"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, ListChecks } from "lucide-react"
import Footer from "@/components/footer"
import { useLanguage } from "@/hooks/use-language"
import { ProjectHeader } from "@/components/projects/project-header"
import { FlowDiagram } from "@/components/automations/flow-diagram"
import { flowIconMap } from "@/components/automations/flow-card"

interface AutomationFlow {
  icon: string
  title: string
  description: string
  useCase: string
  steps: string[]
  demoPlaceholder: string
  demoOutputTemplate: string
}

export default function AutomationDetailPage() {
  const params = useParams<{ slug: string }>()
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

  const flow = flows.find((f) => f.icon === params.slug)

  const tryPrompt = String(t("automations.tryPrompt") || "")
  const sendLabel = String(t("automations.sendLabel") || "")
  const outputLabel = String(t("automations.outputLabel") || "")
  const whatItDoes = String(t("automations.detail.whatItDoes") || "Qué hace")
  const howItsUsed = String(t("automations.detail.howItsUsed") || "Cómo se usa")
  const tryLive = String(t("automations.detail.tryLive") || "Probalo en vivo")
  const stepsHeading = String(t("automations.detail.stepsHeading") || "")
  const notFoundLabel = String(t("automations.detail.notFound") || "")
  const backToList = String(t("automations.detail.backToList") || "Volver")

  if (isMounted && !flow) {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center">
        <p className="text-slate-400 mb-6">{notFoundLabel}</p>
        <Link href="/automations" className="text-blue-500 hover:text-blue-400 inline-flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {backToList}
        </Link>
      </main>
    )
  }

  if (!flow) return null

  const Icon = flowIconMap[flow.icon]

  return (
    <main className="min-h-screen bg-black">
      <section className="pt-32 pb-20 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <ProjectHeader title={flow.title} description={flow.description} />

          <div className="mb-8 -mt-8 flex justify-center">
            <Link
              href="/automations"
              className="inline-flex items-center text-sm text-blue-500 hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backToList}
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-zinc-900/40 border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  {Icon && <Icon className="h-6 w-6 text-blue-500" />}
                </div>
                <h2 className="text-lg font-bold text-blue-400 uppercase tracking-wide">
                  {whatItDoes}
                </h2>
              </div>
              <p className="text-slate-300 leading-relaxed mb-4">{flow.description}</p>
              {stepsHeading && (
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{stepsHeading}</p>
              )}
              <ol className="space-y-2">
                {flow.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                    <ListChecks className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    {step}
                  </li>
                ))}
              </ol>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-zinc-900/40 border border-white/10 rounded-xl p-6"
            >
              <h2 className="text-lg font-bold text-blue-400 uppercase tracking-wide mb-4">
                {howItsUsed}
              </h2>
              <p className="text-slate-300 leading-relaxed">{flow.useCase}</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="w-full"
          >
            <h2 className="text-2xl font-bold text-center mb-8">{tryLive}</h2>
            <FlowDiagram flow={flow} tryPrompt={tryPrompt} sendLabel={sendLabel} outputLabel={outputLabel} />
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
