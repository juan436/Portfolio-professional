"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { useIsMounted } from "@/hooks/use-is-mounted"

/**
 * Fondo animado del Hero — palabras del stack orbitando en el anillo ALREDEDOR
 * de la foto (igual que `QuantumParticles`, con texto).
 * Recibe: `words?` (default: React/Next.js/Node.js/Python/Docker/API).
 * Produce: `null` hasta el mount (evita mismatch de hidratación, usa `Math.random()`).
 *
 * Coordenadas polares desde el centro del contenedor: radio mayor que el de la
 * foto → la palabra nunca queda por debajo ni en el medio. `useMemo` para no
 * recalcular `Math.random()` por render; solo `transform`/`opacity`.
 */
interface FloatingTechWordsProps {
  words?: string[]
}

const DEFAULT_WORDS = ["REACT", "NEXT.JS", "NODE.JS", "PYTHON", "DOCKER", "API"]
const R_MIN = 200
const R_MAX = 245

interface Track {
  x: number[]
  y: number[]
  duration: number
  delay: number
}

export function FloatingTechWords({ words = DEFAULT_WORDS }: FloatingTechWordsProps) {
  const isMounted = useIsMounted()

  const tracks = useMemo<Track[]>(
    () =>
      words.map((_, i) => {
        // reparte las palabras por el anillo (una franja de ángulo cada una) y
        // deja que cada una oscile un poco dentro de su franja
        const base = (i / words.length) * Math.PI * 2
        const angles = [base, base + (Math.random() - 0.5) * 0.9, base + (Math.random() - 0.5) * 0.9]
        const radii = [0, 1, 2].map(() => R_MIN + Math.random() * (R_MAX - R_MIN))
        return {
          x: angles.map((a, k) => Math.cos(a) * radii[k]),
          y: angles.map((a, k) => Math.sin(a) * radii[k]),
          duration: 11 + Math.random() * 6,
          delay: i * 0.8,
        }
      }),
    [words]
  )

  if (!isMounted) return null

  return (
    <>
      {words.map((word, i) => (
        <motion.div
          key={word}
          initial={{ x: tracks[i].x[0], y: tracks[i].y[0], opacity: 0 }}
          animate={{ x: tracks[i].x, y: tracks[i].y, opacity: [0, 0.7, 0.7, 0] }}
          transition={{
            duration: tracks[i].duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: tracks[i].delay,
            ease: "easeInOut",
          }}
          className="absolute left-1/2 top-1/2 text-xs font-mono font-bold tracking-wider text-blue-400/40 pointer-events-none whitespace-nowrap"
          style={{ willChange: "transform, opacity", textShadow: "0 0 10px rgba(59, 130, 246, 0.5)" }}
        >
          {word}
        </motion.div>
      ))}
    </>
  )
}
