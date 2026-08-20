"use client"

import { motion } from "framer-motion"
import { useIsMounted } from "@/hooks/use-is-mounted"

/**
 * Fondo animado del Hero — 20 partículas flotando con posiciones aleatorias.
 * Recibe: nada.
 * Produce: `null` hasta el mount (evita mismatch de hidratación, usa `Math.random()`); después, las partículas animadas.
 */
export function QuantumParticles() {
  const isMounted = useIsMounted()

  // No renderizar nada durante SSR
  if (!isMounted) {
    return null
  }
  
  return (
    <>
      {/* Partículas cuánticas */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`quantum-particle-${i}`}
          initial={{
            x: Math.random() * 400 - 200,
            y: Math.random() * 400 - 200,
            opacity: 0,
          }}
          animate={{
            x: [Math.random() * 400 - 200, Math.random() * 400 - 200, Math.random() * 400 - 200],
            y: [Math.random() * 400 - 200, Math.random() * 400 - 200, Math.random() * 400 - 200],
            opacity: [0, 1, 0],
            scale: [0, 1, 0.5, 0],
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Number.POSITIVE_INFINITY,
            delay: Math.random() * 3,
            ease: "easeInOut",
          }}
          className="absolute w-1 h-1 bg-blue-500 rounded-full shadow-md shadow-blue-500/50"
          style={{
            boxShadow: "0 0 10px rgba(59, 130, 246, 0.6), 0 0 20px rgba(59, 130, 246, 0.4)",
          }}
        />
      ))}
    </>
  )
}
