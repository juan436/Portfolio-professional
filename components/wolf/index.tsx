"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/hooks/use-language"
import { WolfSvg, getWolfAnimation } from "./wolf-svg"
import { WolfState, WolfTranslations } from "./types"
import { usePathname } from "next/navigation"

export default function WolfGuide() {
  const pathname = usePathname()
  const [currentSection, setCurrentSection] = useState<WolfState>("welcome")
  const [isVisible, setIsVisible] = useState(true)
  const { t } = useLanguage()
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  const [translatedTexts, setTranslatedTexts] = useState<WolfTranslations>({
    welcome: "",
    about: "",
    skills: "",
    projects: "",
    contact: "",
    experience: "",
    idle: "",
  })

  // Cargar traducciones después de la hidratación
  useEffect(() => {
    setTranslatedTexts({
      welcome: String(t("wolf.welcome_short")) || "¡Hola! Bienvenido",
      about: String(t("wolf.about_short")) || "¡Sobre mí!",
      skills: String(t("wolf.skills_short")) || "Mis habilidades",
      projects: String(t("wolf.projects_short")) || "Mis proyectos",
      contact: String(t("wolf.contact_short")) || "¡Contáctame!",
      experience: String(t("wolf.experience_short")) || "¡Mi experiencia!",
      idle: "",
    })
  }, [t])

  // Detect which section is in view
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 2

      const sections = [
        { id: "home", state: "welcome" },
        { id: "about", state: "about" },
        { id: "experience", state: "experience" },
        { id: "skills", state: "skills" },
        { id: "projects", state: "projects" },
        { id: "contact", state: "contact" },
      ]

      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (element) {
          const { top, bottom } = element.getBoundingClientRect()
          const elementTop = top + window.scrollY
          const elementBottom = bottom + window.scrollY

          if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
            // Si estamos entrando a una nueva sección, hacer el lobo visible de nuevo
            if (currentSection !== section.state) {
              setIsVisible(true)

              // Si estamos volviendo a la sección de inicio y ya no es la primera visita
              if (section.state === "welcome" && currentSection !== "idle") {
                setIsFirstVisit(false)
              }
            }
            setCurrentSection(section.state as WolfState)
            return
          }
        }
      }

      setCurrentSection("idle")
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Initial check

    return () => window.removeEventListener("scroll", handleScroll)
  }, [currentSection]) // Add currentSection as a dependency

  // Modify the timer useEffect to reset properly between sections
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (currentSection !== "idle" && isVisible) {
      timer = setTimeout(() => {
        setIsVisible(false)
      }, 8000)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [currentSection, isVisible])

  // No renderizar en rutas del panel administrativo
  if (pathname?.includes("/admin") || pathname?.includes("/dashboard") || pathname?.includes("/projects")) return null
  
  // Don't render if not visible
  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-end">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSection}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={getWolfAnimation(currentSection)}
          className="flex items-center"
        >
          {/* Message bubble - solo mostrar si no es idle y si no es welcome en visitas posteriores */}
          {!(currentSection === "welcome" && !isFirstVisit) && currentSection !== "idle" && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg rounded-br-none shadow-lg text-sm mr-1"
            >
              <p className="whitespace-nowrap">{translatedTexts[currentSection]}</p>
              <div className="absolute bottom-3 right-0 w-3 h-3 bg-blue-600 transform rotate-45 translate-x-1"></div>
            </motion.div>
          )}

          {/* Wolf character */}
          <div className="relative">
            <WolfSvg state={currentSection} isFirstVisit={isFirstVisit} />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
