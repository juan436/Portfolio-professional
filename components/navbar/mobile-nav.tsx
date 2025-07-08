"use client"

import React from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import LanguageSwitcher from "@/components/language-switcher"

interface MobileNavProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  navItems: Array<{ name: string; href: string }>
  activeSection: string
  handleNavClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void
}

export function MobileNav({ 
  isOpen, 
  setIsOpen, 
  navItems, 
  activeSection, 
  handleNavClick 
}: MobileNavProps) {
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

      {/* Mobile Navigation Menu */}
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
              <button
                key={item.href}
                onClick={(e) => handleNavClick(e as any, item.href)}
                className={`py-2 transition-colors duration-300 text-left bg-transparent border-0 cursor-pointer ${
                  activeSection === item.href.substring(1)
                    ? "text-blue-500 font-medium"
                    : "text-slate-300 hover:text-blue-500"
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
