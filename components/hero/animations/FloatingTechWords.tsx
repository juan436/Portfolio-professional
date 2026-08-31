"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { useIsMounted } from "@/hooks/use-is-mounted"

/**
 * Fondo animado del Hero — palabras del stack flotando alrededor de la foto,
 * igual que `QuantumParticles` pero con texto.
 * Recibe: `words?` (default: React/Next.js/Node.js/Python/Docker/API).
 * Produce: `null` hasta el mount (evita mismatch de hidratación, usa `Math.random()`).
 *
 * Optimización (2026-08-31): trayectorias calculadas una sola vez (`useMemo`),
 * solo `transform`/`opacity` + `willChange`. Cada palabra nace en el centro del
 * contenedor (`left-1/2 top-1/2`) y se mueve `± RANGE` — no se escapa hacia el
 * header (el caller además recorta con `overflow-hidden`). Rango más corto que
 * las partículas porque el texto tiene ancho.
 */
interface FloatingTechWordsProps {
  words?: string[]
}

const DEFAULT_WORDS = ["REACT", "NEXT.JS", "NODE.JS", "PYTHON", "DOCKER", "API"]
const RANGE_X = 95
const RANGE_Y = 120

interface Track {
  path: { x: number[]; y: number[] }
  duration: number
  delay: number
}

export function FloatingTechWords({ words = DEFAULT_WORDS }: FloatingTechWordsProps) {
  const isMounted = useIsMounted()

  const tracks = useMemo<Track[]>(
    () =>
      words.map((_, i) => {
        const rx = () => Math.random() * RANGE_X * 2 - RANGE_X
        const ry = () => Math.random() * RANGE_Y * 2 - RANGE_Y
        return {
          path: { x: [rx(), rx(), rx()], y: [ry(), ry(), ry()] },
          duration: 9 + Math.random() * 5,
          delay: i * 1.2,
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
          initial={{ x: tracks[i].path.x[0], y: tracks[i].path.y[0], opacity: 0 }}
          animate={{
            x: tracks[i].path.x,
            y: tracks[i].path.y,
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: tracks[i].duration,
            repeat: Number.POSITIVE_INFINITY,
            delay: tracks[i].delay,
            ease: "easeInOut",
          }}
          className="absolute left-1/2 top-1/2 text-xs font-mono font-bold tracking-wider text-blue-400/40 pointer-events-none"
          style={{ willChange: "transform, opacity", textShadow: "0 0 10px rgba(59, 130, 246, 0.5)" }}
        >
          {word}
        </motion.div>
      ))}
    </>
  )
}
