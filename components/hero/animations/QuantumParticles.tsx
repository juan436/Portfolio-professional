"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { useIsMounted } from "@/hooks/use-is-mounted"

/**
 * Fondo animado del Hero — 16 partículas orbitando en un anillo ALREDEDOR de la
 * foto de perfil (nunca por debajo ni en el centro).
 * Recibe: nada.
 * Produce: `null` hasta el mount (evita mismatch de hidratación, usa `Math.random()`).
 *
 * Cada partícula nace en el centro del contenedor (`left-1/2 top-1/2`) y se
 * mueve por coordenadas polares: radio en `[R_MIN, R_MAX]` (mayor que el radio
 * de la foto, ~160-192px) → siempre queda en el borde exterior del círculo.
 * El ángulo va derivando suave para que parezca que orbita.
 *
 * Optimización (2026-08-31): trayectorias fijas calculadas una sola vez
 * (`useMemo`), solo `transform`/`opacity` (GPU), `willChange`, glow de 1 capa.
 */
const COUNT = 16
const R_MIN = 195
const R_MAX = 245

interface Particle {
  x: number[]
  y: number[]
  duration: number
  delay: number
}

function orbit(): Particle {
  const a0 = Math.random() * Math.PI * 2
  const dir = Math.random() < 0.5 ? 1 : -1
  const angles = [a0, a0 + dir * (0.5 + Math.random()), a0 + dir * (1 + Math.random() * 1.5)]
  const radii = [0, 1, 2].map(() => R_MIN + Math.random() * (R_MAX - R_MIN))
  return {
    x: angles.map((a, i) => Math.cos(a) * radii[i]),
    y: angles.map((a, i) => Math.sin(a) * radii[i]),
    duration: 10 + Math.random() * 6,
    delay: Math.random() * 4,
  }
}

export function QuantumParticles() {
  const isMounted = useIsMounted()
  const particles = useMemo<Particle[]>(() => Array.from({ length: COUNT }, orbit), [])

  if (!isMounted) return null

  return (
    <>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ x: p.x[0], y: p.y[0], opacity: 0 }}
          animate={{ x: p.x, y: p.y, opacity: [0, 1, 1, 0] }}
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
