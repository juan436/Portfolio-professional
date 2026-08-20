"use client"

import { motion } from "framer-motion"
import { useIsMounted } from "@/hooks/use-is-mounted"

/**
 * Fondo animado del Hero — 8 rayos SVG pulsando desde el centro.
 * Recibe: nada.
 * Produce: `null` hasta el mount (evita mismatch de hidratación); después, el SVG animado.
 */
export function QuantumRays() {
  const isMounted = useIsMounted()

  // No renderizar nada durante SSR
  if (!isMounted) {
    return null
  }
  
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
      {[...Array(8)].map((_, i) => {
        const angle = (i * 45 * Math.PI) / 180
        const innerRadius = 140
        const outerRadius = 220
        const centerX = 192
        const centerY = 192

        return (
          <motion.g key={`quantum-ray-${i}`}>
            <motion.line
              stroke="rgba(59, 130, 246, 0.8)"
              strokeWidth="2"
              initial={{
                x1: centerX + innerRadius * Math.cos(angle),
                y1: centerY + innerRadius * Math.sin(angle),
                x2: centerX + outerRadius * Math.cos(angle),
                y2: centerY + outerRadius * Math.sin(angle),
                opacity: 0,
                pathLength: 0
              }}
              animate={{
                opacity: [0, 1, 0],
                pathLength: [0, 1, 0],
                strokeWidth: [1, 3, 1],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.25,
              }}
            />
            {/* Nodos de energía en los extremos */}
            <motion.circle
              fill="rgba(59, 130, 246, 0.9)"
              initial={{
                cx: centerX + outerRadius * Math.cos(angle),
                cy: centerY + outerRadius * Math.sin(angle),
                r: 3,
                scale: 0,
                opacity: 0
              }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.25 + 0.5,
              }}
            />
          </motion.g>
        )
      })}
    </svg>
  )
}
