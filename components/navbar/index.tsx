"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/hooks/use-language"
import { Logo } from "./logo"
import { DesktopNav } from "./desktop-nav"
import { MobileNav } from "./mobile-nav"

export default function Navbar() {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("home")
  const [translatedTexts, setTranslatedTexts] = useState({
    home: "",
    about: "",
    experience: "",
    projects: "",
    skills: "",
    contact: ""
  })
  const [navItems, setNavItems] = useState<Array<{ name: string, href: string }>>([])

  // Cargar traducciones después de la hidratación
  useEffect(() => {
    setTranslatedTexts({
      home: String(t("nav.home")),
      about: String(t("nav.about")),
      experience: String(t("nav.experience")),
      projects: String(t("nav.projects")),
      skills: String(t("nav.skills")),
      contact: String(t("nav.contact"))
    })
  }, [t])

  // Inicializar los elementos de navegación después de la hidratación
  useEffect(() => {
    setNavItems([
      { name: translatedTexts.home, href: "#home" },
      { name: translatedTexts.about, href: "#about" },
      { name: translatedTexts.experience, href: "#experience" },
      { name: translatedTexts.projects, href: "#projects" },
      { name: translatedTexts.skills, href: "#skills" },
      { name: translatedTexts.contact, href: "#contact" },
    ])
  }, [translatedTexts])

  // Detectar scroll para cambiar el estilo de la barra de navegación
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }

      // También detectar qué sección está activa
      const sections = ["home", "about", "experience", "projects", "skills", "contact"]
      const scrollPosition = window.scrollY + window.innerHeight / 3

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { top, bottom } = element.getBoundingClientRect()
          const elementTop = top + window.scrollY
          const elementBottom = bottom + window.scrollY

          if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault() // Prevenir el comportamiento predeterminado del enlace

    // Cerrar el menú móvil si está abierto
    if (isOpen) {
      setIsOpen(false)
    }

    // Obtener el ID de la sección (eliminar el #)
    const targetId = href.substring(1)
    const targetElement = document.getElementById(targetId)

    if (targetElement) {
      // Calcular la posición de desplazamiento (considerando la altura de la barra de navegación)
      const navbarHeight = 80 // Altura aproximada de la barra de navegación
      const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navbarHeight

      // Desplazarse suavemente a la posición
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      })

      // Actualizar la sección activa
      setActiveSection(targetId)
    }
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/80 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Logo />
          
          {/* Desktop Navigation */}
          <DesktopNav 
            navItems={navItems} 
            activeSection={activeSection} 
            handleNavClick={handleNavClick} 
          />

          {/* Mobile Navigation Toggle and Menu */}
          <MobileNav 
            isOpen={isOpen} 
            setIsOpen={setIsOpen} 
            navItems={navItems} 
            activeSection={activeSection} 
            handleNavClick={handleNavClick} 
          />
        </div>
      </nav>
    </motion.header>
  )
}
