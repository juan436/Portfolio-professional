"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { useIsMounted } from "@/hooks/use-is-mounted"

/**
 * Fondo animado del Hero — 12 partículas flotando alrededor de la foto de perfil.
 * Recibe: nada.
 * Produce: `null` hasta el mount (evita mismatch de hidratación, usa `Math.random()`); después, las partículas.
 *
 * Optimización (2026-08-31): antes eran 20 partículas con doble `box-shadow`
 * difuminado y `Math.random()` recalculado en cada render dentro del array de
 * keyframes — repintado caro por frame. Ahora: 12 partículas, trayectorias
 * fijas calculadas una sola vez (`useMemo`), solo `transform`/`opacity`
 * (compuesto en GPU), `willChange`, glow de una sola capa.
 *
 * Cada partícula nace en el centro del contenedor (`left-1/2 top-1/2`) y se
 * mueve `± RANGE` desde ahí — el enjambre queda pegado a la foto y no se escapa
 * hacia el header. El caller además lo recorta con `overflow-hidden`.
 */
const COUNT = 12
const RANGE = 140

const rand = () => Math.random() * RANGE * 2 - RANGE

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
        fromX: rand(),
        fromY: rand(),
        toX: rand(),
        toY: rand(),
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
          className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-blue-400"
          style={{
            willChange: "transform, opacity",
            boxShadow: "0 0 6px rgba(59, 130, 246, 0.6)",
          }}
        />
      ))}
    </>
  )
}
