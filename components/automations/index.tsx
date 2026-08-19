"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useLanguage } from "@/hooks/use-language"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { AutomationShowcaseCard, type ShowcaseAutomation } from "./automation-showcase-card"

interface RawAutomation {
  _id: string
  slug: string
  title: string
  description: string
  subtype?: string
  automationDetails?: {
    icon?: string
    flow?: { steps?: string[]; demoPlaceholder?: string; demoOutputTemplate?: string }
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
  steps?: string[]
  demoPlaceholder?: string
  demoOutputTemplate?: string
}

interface AutomationsProps {
  automations: RawAutomation[]
}

export default function Automations({ automations }: AutomationsProps) {
  const { language, t } = useLanguage()
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const title = String(t("automations.title") || "Automatizaciones")
  const subtitle = String(t("automations.subtitle") || "")
  const viewMore = String(t("automations.viewMore") || "Ver todas las automatizaciones")
  const tryPrompt = String(t("automations.tryPrompt") || "")
  const sendLabel = String(t("automations.sendLabel") || "")
  const outputLabel = String(t("automations.outputLabel") || "")
  const viewDetailLabel = String(t("automations.detail.viewDetail") || "Ver detalle")

  const showcaseList: ShowcaseAutomation[] = automations.map((auto) => {
    const translated = auto.translations?.[language.code as "en" | "fr" | "it"]
    const isEs = language.code === "es"
    const details = auto.automationDetails

    return {
      id: auto._id,
      slug: auto.slug,
      icon: details?.icon || "",
      title: isEs ? auto.title : translated?.title || auto.title,
      description: isEs ? auto.description : translated?.description || auto.description,
      subtype: isEs ? auto.subtype : translated?.subtype || auto.subtype,
      steps: (isEs ? details?.flow?.steps : translated?.steps) || details?.flow?.steps || [],
      demoPlaceholder: (isEs ? details?.flow?.demoPlaceholder : translated?.demoPlaceholder) || details?.flow?.demoPlaceholder || "",
      demoOutputTemplate:
        (isEs ? details?.flow?.demoOutputTemplate : translated?.demoOutputTemplate) || details?.flow?.demoOutputTemplate || "{input}",
    }
  })

  const goPrev = () => {
    setDirection(-1)
    setActiveIndex((i) => (i - 1 + showcaseList.length) % showcaseList.length)
  }
  const goNext = () => {
    setDirection(1)
    setActiveIndex((i) => (i + 1) % showcaseList.length)
  }
  const goTo = (i: number) => {
    setDirection(i > activeIndex ? 1 : -1)
    setActiveIndex(i)
  }
  const active = showcaseList[activeIndex]

  return (
    <section id="automations" className="py-24 bg-black relative overflow-hidden">
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-3"
          >
            <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 shrink-0">02</span>
            <div className="h-px flex-1 bg-gradient-to-r from-blue-600/50 to-transparent" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 shrink-0">
              {title} · {showcaseList.length}
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

        {active && (
          <div className="max-w-6xl mx-auto">
            <AutomationShowcaseCard
              automation={active}
              direction={direction}
              tryPrompt={tryPrompt}
              sendLabel={sendLabel}
              outputLabel={outputLabel}
              viewDetailLabel={viewDetailLabel}
            />

            {showcaseList.length > 1 && (
              <div className="flex items-center justify-center gap-6 mt-8">
                <button
                  onClick={goPrev}
                  aria-label="Anterior"
                  className="p-2 rounded-full border border-white/10 text-slate-400 hover:text-blue-500 hover:border-blue-500/50 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-2">
                  {showcaseList.map((item, i) => (
                    <button
                      key={item.id}
                      onClick={() => goTo(i)}
                      aria-label={item.title}
                      className={`h-2 rounded-full transition-all ${
                        i === activeIndex ? "w-6 bg-blue-500" : "w-2 bg-white/20 hover:bg-white/40"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={goNext}
                  aria-label="Siguiente"
                  className="p-2 rounded-full border border-white/10 text-slate-400 hover:text-blue-500 hover:border-blue-500/50 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {showcaseList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-12 flex justify-center"
          >
            <Link
              href="/automations"
              className="group inline-flex items-center border border-blue-700/50 text-blue-500 hover:bg-blue-700/10 hover:border-blue-500 transition-all duration-300 rounded-md px-4 py-2 text-sm font-medium"
            >
              {viewMore}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}
