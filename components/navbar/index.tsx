"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/hooks/use-language"
import { Logo } from "./logo"
import { DesktopNav } from "./desktop-nav"
import { MobileNav } from "./mobile-nav"
import type { NavEntry } from "./types"

export default function Navbar() {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [navItems, setNavItems] = useState<NavEntry[]>([])

  // Cargar traducciones después de la hidratación
  useEffect(() => {
    setNavItems([
      { name: String(t("nav.home") || "Inicio"), href: "/" },
      { name: String(t("nav.work") || "Trabajo"), href: "/work" },
      { name: String(t("nav.laboratory") || "Laboratorio"), href: "/laboratory" },
      { name: String(t("nav.certificates") || "Certificaciones"), href: "/certificates" },
      { name: String(t("nav.blog") || "Blog"), href: "/blog" },
      { name: String(t("nav.contact") || "Contacto"), href: "/contact" },
    ])
  }, [t])

  // Detectar scroll para cambiar el estilo de la barra de navegación
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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
          <DesktopNav navItems={navItems} />

          {/* Mobile Navigation Toggle and Menu */}
          <MobileNav isOpen={isOpen} setIsOpen={setIsOpen} navItems={navItems} />
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
    </motion.header>
  )
}
