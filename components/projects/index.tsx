"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/hooks/use-language"
import { useTranslatedTexts } from "@/hooks/use-translated-texts"
import { ProjectsGrid } from "./projects-grid"
import type { Project, Projects as ProjectsShape } from "@/contexts/content/types"

/**
 * Sección "Proyectos" de /work (categorías web/mobile/infra_backend).
 * Recibe: `projects` (crudo con traducciones, del Server Component `/work` —
 *   mismo patrón que Automations/Agents). Antes leía del `ContentProvider`, que
 *   se hidrata en el navegador (`useLayoutEffect`) → el grid mostraba un spinner
 *   hasta que hidrataba. Con la data por prop ya viene en el HTML del server.
 * Produce: `ProjectsGrid` con tabs por categoría + contador total.
 */
function localize(list: Project[], langCode: string): Project[] {
  return list.map((p) => {
    const tr = langCode !== "es" ? p.translations?.[langCode as "en" | "fr" | "it"] : undefined
    let image = p.image || ""
    if (image && !image.startsWith("/") && !image.startsWith("http")) image = `https://${image}`
    return {
      ...p,
      title: tr?.title || p.title,
      description: tr?.description || p.description,
      image,
      tags: p.tags || [],
    }
  })
}

export default function Projects({ projects }: { projects: ProjectsShape }) {
  const { language } = useLanguage()

  const combinedProjects = {
    web: localize(projects.web, language.code),
    mobile: localize(projects.mobile, language.code),
    infra_backend: localize(projects.infra_backend, language.code),
  }

  const translatedTexts = useTranslatedTexts(
    (t) => ({
      subtitle: String(t("projects.subtitle")),
      navLabel: String(t("nav.projects")),
      web: String(t("projects.systems")),
      mobile: String(t("projects.mobile")),
      infra_backend: String(t("projects.backend")),
      all: String(t("projects.all")),
      noProjects: String(t("projects.noProjects")),
      code: String(t("projects.code")),
      demo: String(t("projects.demo")),
      repo: String(t("projects.repo")),
      docs: String(t("projects.docs")),
      viewMore: String(t("projects.viewMore_general")),
    }),
    {
      subtitle: "",
      navLabel: "",
      web: "",
      mobile: "",
      infra_backend: "",
      all: "",
      noProjects: "",
      code: "",
      demo: "",
      repo: "",
      docs: "",
      viewMore: "",
    }
  )

  const totalCount = combinedProjects.web.length + combinedProjects.mobile.length + combinedProjects.infra_backend.length

  return (
    <section id="projects" className="py-20 relative">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3 mb-3"
          >
            <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-500 shrink-0">01</span>
            <div className="h-px flex-1 bg-gradient-to-r from-blue-600/50 to-transparent" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 shrink-0">
              {translatedTexts.navLabel} · {totalCount}
            </span>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-slate-500 text-sm max-w-xl"
          >
            {translatedTexts.subtitle}
          </motion.p>
        </div>

        <ProjectsGrid
          localProjects={combinedProjects}
          isLoading={false}
          translatedTexts={translatedTexts}
        />
      </div>
    </section>
  )
}
