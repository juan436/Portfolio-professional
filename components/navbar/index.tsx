"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useTranslatedTexts } from "@/hooks/use-translated-texts"
import { Logo } from "./logo"
import { DesktopNav } from "./desktop-nav"
import { MobileNav } from "./mobile-nav"
import type { NavEntry } from "./types"

/**
 * Navbar del sitio público (no se renderiza en /admin, ver `SiteChrome`).
 * Recibe: nada.
 * Procesa: cambia de fondo transparente a sólido al pasar 50px de scroll.
 * Produce: `Logo` + `DesktopNav`/`MobileNav` según viewport.
 */
export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navItems = useTranslatedTexts<NavEntry[]>(
    (t) => [
      { name: String(t("nav.home") || "Inicio"), href: "/" },
      { name: String(t("nav.work") || "Trabajo"), href: "/work" },
      { name: String(t("nav.laboratory") || "Laboratorio"), href: "/laboratory" },
      { name: String(t("nav.certificates") || "Certificaciones"), href: "/certificates" },
      { name: String(t("nav.blog") || "Blog"), href: "/blog" },
      { name: String(t("nav.contact") || "Contacto"), href: "/contact" },
    ],
    []
  )

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

          <DesktopNav navItems={navItems} />

          <MobileNav isOpen={isOpen} setIsOpen={setIsOpen} navItems={navItems} />
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
    </motion.header>
  )
}
