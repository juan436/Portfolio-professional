"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/hooks/use-language"
import { useContent } from "@/contexts/content"
import { ProjectsTabs } from "./projects-tabs"
import { useTranslatedContent } from "@/hooks/use-translated-content"

export default function Projects() {
  const [activeTab, setActiveTab] = useState("systems")
  const { t, language } = useLanguage()
  const { content, isLoading } = useContent()
  const { translatedContent } = useTranslatedContent()

  // Combinar proyectos traducidos con las etiquetas e imágenes del contenido original
  const combinedProjects = {
    systems: translatedContent.projects?.systems?.map(project => {
      const originalProject = content.projects.systems.find(p => p.id === project.id);

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
    backend: translatedContent.projects?.backend?.map(project => {
      const originalProject = content.projects.backend.find(p => p.id === project.id);

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
    title: "",
    subtitle: "",
    systems: "",
    mobile: "",
    backend: "",
    code: "",
    demo: "",
    repo: "",
    docs: "",
    viewMore: "",
  })

  // Cargar traducciones después de la hidratación
  useEffect(() => {
    setTranslatedTexts({
      title: String(t("projects.title")),
      subtitle: String(t("projects.subtitle")),
      systems: String(t("projects.systems")),
      mobile: String(t("projects.mobile")),
      backend: String(t("projects.backend")),
      code: String(t("projects.code")),
      demo: String(t("projects.demo")),
      repo: String(t("projects.repo")),
      docs: String(t("projects.docs")),
      viewMore: String(t("projects.viewMore_general")),
    })
  }, [t, language])

  console.log("combinedProjects", combinedProjects)
  return (
    <section id="projects" className="py-20 relative">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{translatedTexts.title}</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8">{translatedTexts.subtitle}</p>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
        </motion.div>

        <ProjectsTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          localProjects={combinedProjects}
          isLoading={isLoading}
          translatedTexts={translatedTexts}
        />
      </div>
    </section>
  )
}
