"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/hooks/use-language"
import { useContent } from "@/contexts/content"
import { ProjectsGrid } from "./projects-grid"
import { useTranslatedContent } from "@/hooks/use-translated-content"

export default function Projects() {
  const { t, language } = useLanguage()
  const { content, isLoading } = useContent()
  const { translatedContent } = useTranslatedContent()

  // Combinar proyectos traducidos con las etiquetas e imágenes del contenido original
  const combinedProjects = {
    web: translatedContent.projects?.web?.map(project => {
      const originalProject = content.projects.web.find(p => p.id === project.id);

      let imageUrl = originalProject?.image || "/placeholder.svg?height=400&width=600";
      if (imageUrl && !imageUrl.startsWith("/") && !imageUrl.startsWith("http")) {
        imageUrl = `https://${imageUrl}`;
      }

      return {
        ...project,
        tags: originalProject?.tags || [],
        image: imageUrl
      };
    }) || [],
    mobile: translatedContent.projects?.mobile?.map(project => {
      const originalProject = content.projects.mobile.find(p => p.id === project.id);

      let imageUrl = originalProject?.image || "/placeholder.svg?height=400&width=600";
      if (imageUrl && !imageUrl.startsWith("/") && !imageUrl.startsWith("http")) {
        imageUrl = `https://${imageUrl}`;
      }

      return {
        ...project,
        tags: originalProject?.tags || [],
        image: imageUrl
      };
    }) || [],
    infra_backend: translatedContent.projects?.infra_backend?.map(project => {
      const originalProject = content.projects.infra_backend.find(p => p.id === project.id);

      let imageUrl = originalProject?.image || "/placeholder.svg?height=400&width=600";
      if (imageUrl && !imageUrl.startsWith("/") && !imageUrl.startsWith("http")) {
        imageUrl = `https://${imageUrl}`;
      }

      return {
        ...project,
        tags: originalProject?.tags || [],
        image: imageUrl
      };
    }) || []
  };

  const [translatedTexts, setTranslatedTexts] = useState({
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
  })

  // Cargar traducciones después de la hidratación
  useEffect(() => {
    setTranslatedTexts({
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
    })
  }, [t, language])

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
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
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
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-slate-500 text-sm max-w-xl"
          >
            {translatedTexts.subtitle}
          </motion.p>
        </div>

        <ProjectsGrid
          localProjects={combinedProjects}
          isLoading={isLoading}
          translatedTexts={translatedTexts}
        />
      </div>
    </section>
  )
}
