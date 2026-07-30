"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useLanguage } from "@/hooks/use-language"
import { ArrowRight } from "lucide-react"
import { FlowCard } from "./flow-card"

interface AutomationFlow {
  icon: string
  title: string
  description: string
  steps: string[]
}

export default function Automations() {
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
  const inProgressLabel = String(t("automations.inProgress") || "EN CONSTRUCCIÓN")
  const stepsWord = String(t("automations.stepsWord") || "pasos")
  const viewMore = String(t("automations.viewMore") || "Ver todas las automatizaciones")

  if (!isMounted) return null

  return (
    <section id="automations" className="py-24 bg-black relative overflow-hidden">
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8">{subtitle}</p>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-8" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {flows.map((flow, index) => (
            <FlowCard
              key={flow.icon}
              icon={flow.icon}
              title={flow.title}
              description={flow.description}
              stepsCount={flow.steps.length}
              stepsWord={stepsWord}
              inProgressLabel={inProgressLabel}
              index={index}
            />
          ))}
        </div>

        {flows.length > 0 && (
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
