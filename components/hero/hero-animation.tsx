"use client"

import { useRef } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { useContent } from "@/contexts/content"
import { DbImage } from "@/components/common/db-image"
import { QuantumParticles, FloatingTechWords, CodeCard } from "./animations"

/**
 * Avatar animado del Hero — foto de perfil con partículas + palabras del stack
 * flotando de fondo, y flip a `CodeCard` al hacer click.
 * Recibe: `showAnimation`/`toggleAnimation` (estado del flip, del padre) + `codeLines` (para `CodeCard`).
 * Procesa: los fondos solo corren mientras el contenedor está en viewport (`useInView`) y se
 *   desmontan durante el flip. Antes había 5 capas (hexágonos/rayos/ondas incluidas, ~48 nodos
 *   animados infinitos) — se quitaron las 3 caras por el costo en el hilo principal.
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
  // Las partículas animan en loop infinito — no hay razón para que sigan
  // corriendo cuando ya scrolleaste lejos del Hero.
  const isInView = useInView(containerRef)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="flex justify-center"
    >
      <div ref={containerRef} className="relative w-80 h-80 md:w-96 md:h-96">
        {/* Fondos en un anillo ALREDEDOR de la foto (no debajo ni en el medio).
            El contenedor se agranda para dar espacio al orbitar; queda muy por
            debajo del header. */}
        {isInView && !showAnimation && (
          <div className="pointer-events-none absolute -inset-24">
            <QuantumParticles />
            <FloatingTechWords />
          </div>
        )}

        {/* Imagen del perfil con animación */}
        <div className="absolute inset-0 rounded-full overflow-hidden z-20">
          <div className="relative w-full h-full cursor-pointer" onClick={toggleAnimation}>
            <AnimatePresence>
              {!showAnimation ? (
                <DbImage
                  src={content.hero.profileImage}
                  alt="Juan Villegas"
                  className="w-full h-full rounded-full"
                  imgClassName="object-cover object-center"
                  sizes="384px"
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
