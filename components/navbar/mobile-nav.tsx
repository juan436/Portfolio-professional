"use client"

import { LocalizedLink as Link, usePathWithoutLocale } from "@/components/common/localized-link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import LanguageSwitcher from "@/components/language-switcher"
import type { NavEntry } from "./types"

/**
 * Navegación mobile (navbar) — botón hamburguesa + menú desplegable.
 * Recibe: `isOpen`/`setIsOpen` (estado del padre) + `navItems: NavEntry[]`.
 * Produce: menú que se cierra solo al elegir un link.
 */
interface MobileNavProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  navItems: NavEntry[]
}

export function MobileNav({ isOpen, setIsOpen, navItems }: MobileNavProps) {
  const pathname = usePathWithoutLocale()

  return (
    <div className="md:hidden flex items-center gap-2">
      <LanguageSwitcher />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-200 hover:text-blue-500"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </Button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="md:hidden mt-4 bg-black/90 backdrop-blur-md rounded-lg p-4 absolute top-full left-0 right-0 mx-4"
        >
          <div className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`py-2 transition-colors duration-300 text-left ${
                  pathname === item.href ? "text-blue-500 font-medium" : "text-slate-300 hover:text-blue-500"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
