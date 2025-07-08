"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/hooks/use-language"
import { RobotWolf } from "./robot-wolf"
import { WelcomeText } from "./welcome-text"

export default function WelcomeAnimation() {
  const [showAnimation, setShowAnimation] = useState(false)
  const { t } = useLanguage()

  // Solo mostrar la animación en la primera visita
  useEffect(() => {
    // Verificar si es la primera visita
    const hasVisitedBefore = sessionStorage.getItem("hasVisitedBefore")

    if (!hasVisitedBefore) {
      // Primera visita, mostrar animación
      setShowAnimation(true)
      // Marcar que ya ha visitado el sitio
      sessionStorage.setItem("hasVisitedBefore", "true")

      // Ocultar la animación después de completarse
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
