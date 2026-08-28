"use client"

import { useEffect, useState } from "react"
import { LocalizedLink as Link } from "@/components/common/localized-link"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/hooks/use-language"
import { IdlePose } from "./poses/idle-pose"
import { welcomeOverlaySignal } from "@/lib/welcome-overlay-signal"

/**
 * Widget flotante del lobo (guía persistente hacia /contact) — reescrito sesión 2026-08-18 (Plan Lobo).
 * Recibe: nada.
 * Procesa: espera a que termine el overlay de bienvenida (`welcomeOverlaySignal`) antes de mostrarse;
 * saluda una vez al aparecer, después queda quieto hasta hover.
 * Produce: `null` en /admin, /dashboard, /projects, /contact; si no, ícono flotante con link a /contact.
 */
export default function WolfGuide() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [hovered, setHovered] = useState(false)
  const [visible, setVisible] = useState(false)
  const [showGreeting, setShowGreeting] = useState(false)

  // Esperar a que termine la superposición de bienvenida (primera visita)
  // antes de mostrarse. Si nunca hubo superposición (visita repetida, o el
  // primer load no fue en "/"), activeUntil sigue en 0 y se muestra ya.
  useEffect(() => {
    const remaining = welcomeOverlaySignal.activeUntil - Date.now()
    if (remaining > 0) {
      const timer = setTimeout(() => setVisible(true), remaining)
      return () => clearTimeout(timer)
    }
    setVisible(true)
  }, [])

  // Al aparecer, saluda un momento y después queda quieto hasta el hover
  useEffect(() => {
    if (!visible) return
    setShowGreeting(true)
    const timer = setTimeout(() => setShowGreeting(false), 4000)
    return () => clearTimeout(timer)
  }, [visible])

  // No renderizar en rutas del panel administrativo ni en /contact
  if (
    pathname?.includes("/admin") ||
    pathname?.includes("/dashboard") ||
    pathname?.includes("/projects") ||
    pathname?.includes("/contact")
  )
    return null
  if (!visible) return null

  return (
    <Link
      href="/contact"
      className="fixed bottom-4 right-4 z-50 block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative">
        <AnimatePresence>
          {(showGreeting || hovered) && (
            <motion.div
              initial={{ opacity: 0, x: 6, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 6, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-full top-0 mr-2 z-20 pointer-events-none"
            >
              <div className="relative bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                <p className="text-sm">
                  {String(t(showGreeting ? "wolf.welcome_short" : "wolf.talk_prompt"))}
                </p>
                <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-blue-600 rotate-45" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <svg width="80" height="73" viewBox="0 0 110 100">
          <IdlePose />
        </svg>
      </div>
    </Link>
  )
}
