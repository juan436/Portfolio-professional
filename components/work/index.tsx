"use client"

import { motion } from "framer-motion"
import { Bot, Code2, Workflow } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

/**
 * Intro de la página `/work` — título/subtítulo + 3 botones de scroll a las secciones de abajo.
 * Recibe: nada.
 * Produce: encabezado + botones que hacen scroll suave a `#projects`/`#automations`/`#agents`.
 */
export default function WorkIntro() {
  const { t } = useLanguage()
  const texts = {
    title: String(t("work.title")),
    subtitle: String(t("work.subtitle")),
    ctaProjects: String(t("work.ctaProjects")),
    ctaAutomations: String(t("work.ctaAutomations")),
    ctaAgents: String(t("work.ctaAgents")),
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="pb-8 md:pb-10 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/90 to-black" />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight text-blue-500"
        >
          {texts.title}
        </motion.h1>

        <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-400 text-lg leading-relaxed mb-6"
        >
          {texts.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <button
            onClick={() => scrollToSection("projects")}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]"
          >
            <Code2 className="h-4 w-4" />
            {texts.ctaProjects}
          </button>
          <button
            onClick={() => scrollToSection("automations")}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 border border-blue-600/50 text-blue-400 hover:bg-blue-600/10 font-bold transition-all duration-300"
          >
            <Workflow className="h-4 w-4" />
            {texts.ctaAutomations}
          </button>
          <button
            onClick={() => scrollToSection("agents")}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 border border-blue-600/50 text-blue-400 hover:bg-blue-600/10 font-bold transition-all duration-300"
          >
            <Bot className="h-4 w-4" />
            {texts.ctaAgents}
          </button>
        </motion.div>
      </div>
    </section>
  )
}
