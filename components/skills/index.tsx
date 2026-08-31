"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useContent } from "@/contexts/content"
import { useTranslatedTexts } from "@/hooks/use-translated-texts"
import { SkillsTabs } from "./skills-tabs"
import { OtherSkills } from "./other-skills"

/**
 * Sección "Habilidades" del home.
 * Recibe: nada (lee `content.skills`/`content.otherSkills`; también escucha el evento legacy `contentUpdated`).
 * Produce: `SkillsTabs` (por categoría técnica) + `OtherSkills` (lista libre).
 */
export default function Skills() {
  const { content } = useContent()
  const [activeTab, setActiveTab] = useState("frontend")
  const [skills, setSkills] = useState(content.skills)
  const [otherSkills, setOtherSkills] = useState(content.otherSkills)
  const translatedTexts = useTranslatedTexts(
    (t) => ({
      title: String(t("skills.title")),
      subtitle: String(t("skills.subtitle")),
      frontend: String(t("skills.frontend")),
      backend: String(t("skills.backend")),
      database: String(t("skills.database")),
      devops: String(t("skills.devops")),
      other: String(t("skills.other")),
      viewExperience: String(t("skills.viewExperience"))
    }),
    { title: "", subtitle: "", frontend: "", backend: "", database: "", devops: "", other: "", viewExperience: "" }
  )

  useEffect(() => {
    setSkills(content.skills)
    setOtherSkills(content.otherSkills)
  }, [content])

  useEffect(() => {
    const handleContentUpdated = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail) {
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

  return (
    <section id="skills" className="py-20 bg-black/50 relative">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/devicons/devicon@2.17.0/devicon.min.css" precedence="default" />
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
