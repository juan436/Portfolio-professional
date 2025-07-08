"use client"

import React from "react"
import LanguageSwitcher from "@/components/language-switcher"

interface DesktopNavProps {
  navItems: Array<{ name: string; href: string }>
  activeSection: string
  handleNavClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void
}

export function DesktopNav({ navItems, activeSection, handleNavClick }: DesktopNavProps) {
  return (
    <div className="hidden md:flex items-center">
      <div className="flex space-x-8 mr-4">
        {navItems.map((item) => (
          <button
            key={item.href}
            onClick={(e) => handleNavClick(e as any, item.href)}
            className={`transition-colors duration-300 bg-transparent border-0 cursor-pointer ${
              activeSection === item.href.substring(1)
                ? "text-blue-500 font-medium"
                : "text-slate-300 hover:text-blue-500"
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>
      <LanguageSwitcher />
    </div>
  )
}
