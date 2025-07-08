"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Globe } from "lucide-react"
import { languages } from "@/contexts/language-context"
import { useLanguage } from "@/hooks/use-language"

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Cerrar el dropdown cuando se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Manejar el cambio de idioma
  const handleLanguageChange = (newLang: typeof language) => {
    // Si el idioma seleccionado es el mismo que ya está activo, no hacer nada
    if (newLang.code === language.code) {
      setIsOpen(false)
      return
    }

    setLanguage(newLang)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-black/30 hover:bg-blue-700/30 border border-blue-700/20 transition-all hover:scale-105"
        aria-label="Cambiar idioma"
      >
        <Globe className="h-5 w-5 text-blue-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-40 bg-black/80 backdrop-blur-sm border border-blue-700/20 rounded-md shadow-lg z-50"
          >
            <div className="py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang)}
                  className={`flex items-center w-full px-4 py-2 text-left hover:bg-blue-700/20 transition-colors ${language.code === lang.code ? "bg-blue-700/30 text-blue-400" : ""
                    }`}
                >
                  <span className="text-lg mr-2">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
