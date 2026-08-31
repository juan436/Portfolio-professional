"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { useIsMounted } from "@/hooks/use-is-mounted"

/**
 * Fondo animado del Hero — 12 partículas flotando detrás de la foto de perfil.
 * Recibe: nada.
 * Produce: `null` hasta el mount (evita mismatch de hidratación, usa `Math.random()`); después, las partículas.
 *
 * Optimización (2026-08-31): antes eran 20 partículas con doble `box-shadow`
 * difuminado y `Math.random()` recalculado en cada render dentro del array de
 * keyframes — repintado caro por frame. Ahora: 12 partículas, trayectorias
 * fijas calculadas una sola vez (`useMemo`), solo `transform`/`opacity`
 * (compuesto en GPU), `willChange: transform`, glow de una sola capa.
 */
const COUNT = 12

interface Particle {
  fromX: number
  fromY: number
  toX: number
  toY: number
  duration: number
  delay: number
}

export function QuantumParticles() {
  const isMounted = useIsMounted()

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: COUNT }, () => ({
        fromX: Math.random() * 320 - 160,
        fromY: Math.random() * 320 - 160,
        toX: Math.random() * 320 - 160,
        toY: Math.random() * 320 - 160,
        duration: 7 + Math.random() * 4,
        delay: Math.random() * 3,
      })),
    []
  )

  if (!isMounted) return null

  return (
    <>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ x: p.fromX, y: p.fromY, opacity: 0 }}
          animate={{
            x: [p.fromX, p.toX, p.fromX],
            y: [p.fromY, p.toY, p.fromY],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: p.delay,
            ease: "easeInOut",
          }}
          className="absolute w-1 h-1 rounded-full bg-blue-400"
          style={{
            willChange: "transform, opacity",
            boxShadow: "0 0 6px rgba(59, 130, 246, 0.6)",
          }}
        />
      ))}
    </>
  )
}
