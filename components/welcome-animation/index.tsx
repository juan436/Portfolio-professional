"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/hooks/use-language"
import { RobotWolf } from "./robot-wolf"
import { WelcomeText } from "./welcome-text"
import { welcomeOverlaySignal } from "@/lib/welcome-overlay-signal"

/**
 * Overlay de bienvenida de primera visita (pantalla completa, 5s, solo una vez por sesión).
 * Recibe: nada.
 * Procesa: marca `hasVisitedBefore` en sessionStorage y avisa a `welcomeOverlaySignal` (lo lee `WolfGuide`
 * para no aparecer encima del overlay).
 * Produce: `null` en visitas repetidas; si no, `RobotWolf` + `WelcomeText` a pantalla completa.
 */
export default function WelcomeAnimation() {
  const [showAnimation, setShowAnimation] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    const hasVisitedBefore = sessionStorage.getItem("hasVisitedBefore")

    if (!hasVisitedBefore) {
      setShowAnimation(true)
      sessionStorage.setItem("hasVisitedBefore", "true")
      welcomeOverlaySignal.activeUntil = Date.now() + 5000

      const timer = setTimeout(() => {
        setShowAnimation(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [])

  if (!showAnimation) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      <AnimatePresence>
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <RobotWolf />
          <WelcomeText welcomeText={String(t("wolf.welcome"))} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
