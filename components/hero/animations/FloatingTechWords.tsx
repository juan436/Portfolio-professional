"use client"

import { motion } from "framer-motion"
import { useIsMounted } from "@/hooks/use-is-mounted"

interface FloatingTechWordsProps {
  words?: string[]
}

export function FloatingTechWords({ words = ["REACT", "NODE.JS", "API", "DATABASE", "DOCKER"] }: FloatingTechWordsProps) {
  const isMounted = useIsMounted()

  // No renderizar nada durante SSR
  if (!isMounted) {
    return null
  }
  
  return (
    <>
      {/* Datos de desarrollo web flotantes */}
      {words.map((data, index) => (
        <motion.div
          key={`webdev-data-${index}`}
          initial={{
            x: Math.random() * 300 - 150,
            y: Math.random() * 300 - 150,
            opacity: 0,
          }}
          animate={{
            x: Math.random() * 400 - 200,
            y: Math.random() * 400 - 200,
            opacity: [0, 0.7, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Number.POSITIVE_INFINITY,
            delay: index * 1.5,
            ease: "linear",
          }}
          className="absolute text-xs font-mono text-blue-400/40 pointer-events-none font-bold tracking-wider"
          style={{
            textShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
          }}
        >
          {data}
        </motion.div>
      ))}
    </>
  )
}
