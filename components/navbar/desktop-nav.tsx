"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import LanguageSwitcher from "@/components/language-switcher"
import type { NavEntry } from "./types"

/**
 * Navegación desktop (navbar) — links + selector de idioma.
 * Recibe: `navItems: NavEntry[]` (ya traducidos por el caller).
 * Produce: links horizontales, resaltando el activo según `pathname`.
 */
interface DesktopNavProps {
  navItems: NavEntry[]
}

export function DesktopNav({ navItems }: DesktopNavProps) {
  const pathname = usePathname()

  return (
    <div className="hidden md:flex items-center">
      <div className="flex items-center space-x-8 mr-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`transition-colors duration-300 ${
              pathname === item.href ? "text-blue-500 font-medium" : "text-slate-300 hover:text-blue-500"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>
      <LanguageSwitcher />
    </div>
  )
}
