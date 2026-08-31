"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { useIsMounted } from "@/hooks/use-is-mounted"

/**
 * Fondo animado del Hero — palabras del stack flotando detrás de la foto, igual
 * que `QuantumParticles` pero con texto.
 * Recibe: `words?` (default: React/Next.js/Node.js/Python/Docker/API).
 * Produce: `null` hasta el mount (evita mismatch de hidratación, usa `Math.random()`).
 *
 * Optimización (2026-08-31): trayectorias calculadas una sola vez (`useMemo`),
 * solo `transform`/`opacity` + `willChange`, sin recalcular `Math.random()` por
 * render dentro de los keyframes.
 */
interface FloatingTechWordsProps {
  words?: string[]
}

const DEFAULT_WORDS = ["REACT", "NEXT.JS", "NODE.JS", "PYTHON", "DOCKER", "API"]

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
        const rand = () => Math.random() * 320 - 160
        return {
          path: { x: [rand(), rand(), rand()], y: [rand(), rand(), rand()] },
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
          className="absolute text-xs font-mono font-bold tracking-wider text-blue-400/40 pointer-events-none"
          style={{ willChange: "transform, opacity", textShadow: "0 0 10px rgba(59, 130, 246, 0.5)" }}
        >
          {word}
        </motion.div>
      ))}
    </>
  )
}
