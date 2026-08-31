"use client"

import { useRef } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import Image from "next/image"
import { useContent } from "@/contexts/content"
import {
  HexagonalField,
  QuantumRays,
  QuantumParticles,
  FloatingTechWords,
  EnergyWaves,
  CodeCard
} from "./animations"

/**
 * Avatar animado del Hero — foto de perfil con 5 fondos animados + flip a `CodeCard` al hacer click.
 * Recibe: `showAnimation`/`toggleAnimation` (estado del flip, del padre) + `codeLines` (para `CodeCard`).
 * Procesa: pausa los 5 fondos (48 animaciones infinitas) cuando el contenedor sale del viewport (`useInView`).
 * Produce: círculo con la foto de perfil o `CodeCard`, según `showAnimation`.
 */
interface HeroAnimationProps {
  showAnimation: boolean
  toggleAnimation: () => void
  codeLines: string[]
}

export function HeroAnimation({ showAnimation, toggleAnimation, codeLines }: HeroAnimationProps) {
  const { content } = useContent()
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="flex justify-center"
    >
      <div ref={containerRef} className="relative w-80 h-80 md:w-96 md:h-96">
        {isInView && (
          <>
            <HexagonalField />

            <QuantumRays />

            <QuantumParticles />

            <FloatingTechWords />

            <EnergyWaves />
          </>
        )}

        <div className="absolute inset-0 rounded-full overflow-hidden z-20">
          <div className="relative w-full h-full cursor-pointer" onClick={toggleAnimation}>
            <AnimatePresence>
              {!showAnimation ? (
                <Image
                  src={
                    content.hero.profileImage ||
                    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/profile-E9YRocD6o4olhnzraHWCjLmKjCbspw.jpeg"
                  }
                  alt="Juan Villegas"
                  width={400}
                  height={400}
                  className="w-full h-full object-cover object-center rounded-full"
                  priority
                />
              ) : (
                <CodeCard codeLines={codeLines} onClose={toggleAnimation} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
