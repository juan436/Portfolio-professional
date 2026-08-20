"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, ListChecks, MessageCircle, Radio, Timer, TrendingUp, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/hooks/use-language"
import type { RawTestimonial } from "@/services/api/testimonials"
import type { ProjectMetric } from "@/services/api/project-stats"
import { ProjectHeader } from "@/components/projects/project-header"
import { FlowDiagram } from "@/components/automations/flow-diagram"
import { flowIconMap } from "@/components/automations/flow-card"
import { TestimonialCarousel } from "@/components/automations/testimonial-carousel"
import { TestimonialMetrics } from "@/components/projects/testimonial-metrics"

interface RawAutomation {
  _id: string
  title: string
  description: string
  subtype?: string
  automationDetails?: {
    icon?: string
    useCase?: string
    tools?: string[]
    channels?: string[]
    setupTime?: string
    flow?: {
      steps?: string[]
      demoPlaceholder?: string
      demoOutputTemplate?: string
    }
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
  steps?: string[]
  demoPlaceholder?: string
  demoOutputTemplate?: string
  tools?: string[]
  channels?: string[]
  setupTime?: string
  subtype?: string
}

/**
 * Vista de detalle de una automatización (`/automations/[slug]`).
 * Recibe: `automation` (crudo, con traducciones) + `testimonials`/`resultsMetrics` + `cameFromWork`.
 * Produce: qué hace / cómo se usa / `FlowDiagram` interactivo / tools+canales+setup / métricas / testimonios / CTA.
 */
interface AutomationDetailViewProps {
  automation: RawAutomation | null
  testimonials: RawTestimonial[]
  resultsMetrics: ProjectMetric[]
  cameFromWork: boolean
}

export function AutomationDetailView({ automation, testimonials, resultsMetrics, cameFromWork }: AutomationDetailViewProps) {
  const router = useRouter()
  const { language, t } = useLanguage()

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push("/automations")
    }
  }

  const tryPrompt = String(t("automations.tryPrompt") || "")
  const sendLabel = String(t("automations.sendLabel") || "")
  const outputLabel = String(t("automations.outputLabel") || "")
  const whatItDoes = String(t("automations.detail.whatItDoes") || "Qué hace")
  const howItsUsed = String(t("automations.detail.howItsUsed") || "Cómo se usa")
  const tryLive = String(t("automations.detail.tryLive") || "Probalo en vivo")
  const stepsHeading = String(t("automations.detail.stepsHeading") || "")
  const notFoundLabel = String(t("automations.detail.notFound") || "")
  const backToList = String(t("automations.detail.backToList") || "Volver")
  const viewMoreLabel = String(t("automations.viewMore") || "Ver todas las automatizaciones")
  const testimonialHeading = String(t("projects.testimonialHeading") || "Testimonio")
  const resultsHeading = String(t("projects.resultsHeading") || "Métricas y Resultados")
  const ctaHeading = String(t("projects.ctaHeading") || "¿Necesitas algo similar?")
  const ctaText = String(t("projects.ctaText") || "Hablemos sobre tu proyecto.")
  const ctaButton = String(t("projects.ctaButton") || "Hablemos")
  const toolsHeading = String(t("automations.detail.toolsHeading") || "Construido con")
  const channelsHeading = String(t("automations.detail.channelsHeading") || "Canales soportados")
  const setupTimeHeading = String(t("automations.detail.setupTimeHeading") || "Tiempo de puesta en marcha")

  if (!automation) {
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

  const translated = automation.translations?.[language.code as "en" | "fr" | "it"]
  const isEs = language.code === "es"
  const details = automation.automationDetails

  const title = isEs ? automation.title : translated?.title || automation.title
  const description = isEs ? automation.description : translated?.description || automation.description
  const subtype = isEs ? automation.subtype : translated?.subtype || automation.subtype
  const useCase = isEs ? details?.useCase : translated?.useCase || details?.useCase
  const steps = (isEs ? details?.flow?.steps : translated?.steps) || details?.flow?.steps || []
  const demoPlaceholder = (isEs ? details?.flow?.demoPlaceholder : translated?.demoPlaceholder) || details?.flow?.demoPlaceholder || ""
  const demoOutputTemplate =
    (isEs ? details?.flow?.demoOutputTemplate : translated?.demoOutputTemplate) || details?.flow?.demoOutputTemplate || "{input}"
  const tools = (isEs ? details?.tools : translated?.tools) || details?.tools || []
  const channels = (isEs ? details?.channels : translated?.channels) || details?.channels || []
  const setupTime = (isEs ? details?.setupTime : translated?.setupTime) || details?.setupTime

  const Icon = flowIconMap[details?.icon || ""]

  return (
    <main className="min-h-screen bg-black">
      <section className="pt-32 pb-20 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <ProjectHeader
            title={title}
            description={description}
            nav={{
              viewMoreHref: cameFromWork ? "/automations" : undefined,
              viewMoreLabel: cameFromWork ? viewMoreLabel : undefined,
            }}
            subtype={subtype}
            hideHeader
            onBackClick={handleBack}
          />

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
              <p className="text-slate-300 leading-relaxed mb-4">{description}</p>
              {stepsHeading && (
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">{stepsHeading}</p>
              )}
              <ol className="space-y-2">
                {steps.map((step, i) => (
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
              <p className="text-slate-300 leading-relaxed">{useCase}</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="w-full mb-16"
          >
            <h2 className="text-2xl font-bold text-center mb-8">{tryLive}</h2>
            <FlowDiagram
              flow={{
                icon: details?.icon || "",
                title,
                description,
                steps,
                demoPlaceholder,
                demoOutputTemplate,
              }}
              tryPrompt={tryPrompt}
              sendLabel={sendLabel}
              outputLabel={outputLabel}
            />
          </motion.div>

          {(tools.length > 0 || channels.length > 0 || setupTime) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-wrap items-stretch justify-center gap-4 max-w-5xl mx-auto mb-16"
            >
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
                  <p className="text-sm font-bold text-white break-words">{setupTime}</p>
                </div>
              )}
            </motion.div>
          )}

          {resultsMetrics.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mt-16"
            >
              <h2 className="text-xl font-bold text-center mb-8 flex items-center justify-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                {resultsHeading}
              </h2>
              <div className="max-w-6xl mx-auto px-6 sm:px-10">
                <TestimonialMetrics metrics={resultsMetrics} />
              </div>
            </motion.div>
          )}

          {testimonials.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mt-16"
            >
              <h2 className="text-xl font-bold text-center mb-8">{testimonialHeading}</h2>
              <div className="max-w-6xl mx-auto px-6 sm:px-10">
                <TestimonialCarousel testimonials={testimonials} />
              </div>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-16 rounded-xl border border-blue-500/20 bg-blue-500/5 p-8 text-center"
          >
            <h2 className="text-xl font-bold mb-2">{ctaHeading}</h2>
            <p className="text-slate-400 mb-6">{ctaText}</p>
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500">
              <Link href="/#contact">
                <MessageCircle className="mr-2 h-4 w-4" />
                {ctaButton}
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
