"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/hooks/use-language"
import { useContent } from "@/contexts/content"
import Script from "next/script"
import { SkillsTabs } from "./skills-tabs"
import { OtherSkills } from "./other-skills"

export default function Skills() {
  const { t } = useLanguage()
  const { content } = useContent()
  const [activeTab, setActiveTab] = useState("frontend")
  const [skills, setSkills] = useState(content.skills)
  const [otherSkills, setOtherSkills] = useState(content.otherSkills)
  const [skillsData, setSkillsData] = useState(content.skills)
  const [translatedTexts, setTranslatedTexts] = useState({
    title: "",
    subtitle: "",
    frontend: "",
    backend: "",
    database: "",
    devops: "",
    other: "",
    viewExperience: ""
  })

  // Cargar traducciones después de la hidratación
  useEffect(() => {
    setTranslatedTexts({
      title: String(t("skills.title")),
      subtitle: String(t("skills.subtitle")),
      frontend: String(t("skills.frontend")),
      backend: String(t("skills.backend")),
      database: String(t("skills.database")),
      devops: String(t("skills.devops")),
      other: String(t("skills.other")),
      viewExperience: String(t("skills.viewExperience"))
    })
  }, [t])

  // Actualizar cuando cambia el contenido global
  useEffect(() => {
    setSkills(content.skills)
    setOtherSkills(content.otherSkills)
  }, [content])

  // Mejorar la escucha de eventos para actualizar correctamente el componente
  useEffect(() => {
    const handleContentUpdated = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail) {
        // Actualizar solo si hay cambios en las habilidades
        if (customEvent.detail.skills) {
          setSkills(customEvent.detail.skills)
        }
        if (customEvent.detail.otherSkills) {
          setOtherSkills(customEvent.detail.otherSkills)
        }
      }
    }

    window.addEventListener("contentUpdated", handleContentUpdated)
    return () => {
      window.removeEventListener("contentUpdated", handleContentUpdated)
    }
  }, [])

  // Añadir un efecto para escuchar el evento skillsUpdated
  useEffect(() => {
    const handleContentUpdate = (event: CustomEvent) => {
      if (event.detail && event.detail.skills) {
        setSkillsData(event.detail.skills)
      }
    }

    const handleSkillsUpdate = (event: CustomEvent) => {
      if (event.detail) {
        setSkillsData(event.detail)
      }
    }

    // Escuchar eventos de actualización de contenido y habilidades específicamente
    window.addEventListener("contentUpdated", handleContentUpdate as EventListener)
    window.addEventListener("skillsUpdated", handleSkillsUpdate as EventListener)

    return () => {
      window.removeEventListener("contentUpdated", handleContentUpdate as EventListener)
      window.removeEventListener("skillsUpdated", handleSkillsUpdate as EventListener)
    }
  }, [])

  return (
    <section id="skills" className="py-20 bg-black/50 relative">
      {/* Cargar el script de Devicon */}
      <Script src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css" />

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
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
          <p className="text-slate-400 max-w-2xl mx-auto">{translatedTexts.subtitle}</p>
        </motion.div>

        <SkillsTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          skills={skills}
          translatedTexts={translatedTexts}
        />

        <OtherSkills 
          otherSkills={otherSkills}
          translatedTexts={translatedTexts}
        />
      </div>
    </section>
  )
}
