"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useTranslatedTexts } from "@/hooks/use-translated-texts"
import { useContent } from "@/contexts/content/use-content"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ExperienceTimeline } from "./experience-timeline"
import { ExperienceCard } from "./experience-card"

/**
 * Sección "Experiencia" del home — carrusel con timeline, autoplay y gestos táctiles.
 * Recibe: nada (lee `content.experience` del `ContentProvider`).
 * Procesa: ordena por año más reciente primero; deriva los años de la timeline del campo `period`.
 * Produce: `ExperienceTimeline` + `ExperienceCard` + controles prev/next/dots/autoplay.
 */
export default function Experience() {
  const { content } = useContent()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const timelineRef = useRef<HTMLDivElement>(null)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)
  const translatedTexts = useTranslatedTexts(
    (t) => ({
      title: String(t("experience.title")),
      subtitle: String(t("experience.subtitle")),
      viewExperience: String(t("experience.viewExperience")),
      pause: String(t("experience.pause")),
      autoplay: String(t("experience.autoplay"))
    }),
    { title: "", subtitle: "", viewExperience: "", pause: "", autoplay: "" }
  )

  // Asegurarse de que la experiencia esté ordenada por fecha (más reciente primero)
  const sortedExperience = [...content.experience].sort((a, b) => {
    // Extraer el año más reciente de cada período
    const getLatestYear = (period: string) => {
      const years = period.match(/\d{4}/g)
      if (!years) return 0
      return Math.max(...years.map((year) => Number.parseInt(year)))
    }

    const yearA = getLatestYear(a.period)
    const yearB = getLatestYear(b.period)

    return yearB - yearA
  })

  // Extraer años para la línea de tiempo
  const timelineYears = sortedExperience.map((exp) => {
    const match = exp.period.match(/\d{4}/g)
    return match ? match[match.length - 1] : ""
  })

  // Navegación
  const handleNext = () => {
    if (activeIndex < sortedExperience.length - 1) {
      setActiveIndex(activeIndex + 1)
    } else {
      // Opcional: volver al principio cuando llegue al final
      setActiveIndex(0)
    }
  }

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1)
    } else {
      // Opcional: ir al final cuando esté en el principio
      setActiveIndex(sortedExperience.length - 1)
    }
  }

  const handleDotClick = (index: number) => {
    setActiveIndex(index)
  }

  // Autoplay
  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying)
  }

  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        handleNext()
      }, 5000) // Cambiar cada 5 segundos
    } else if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [isAutoPlaying, activeIndex])

  // Manejo de gestos táctiles para el carrusel
  const handleMouseDown = (e: React.MouseEvent | TouchEvent) => {
    setIsDragging(true)
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    setStartX(clientX)
  }

  const handleMouseMove = (e: React.MouseEvent | TouchEvent) => {
    if (!isDragging) return

    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const diff = startX - clientX

    if (diff > 50) {
      handleNext()
      setIsDragging(false)
    } else if (diff < -50) {
      handlePrev()
      setIsDragging(false)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Agregar event listeners para gestos táctiles
  useEffect(() => {
    const timeline = timelineRef.current
    if (timeline) {
      timeline.addEventListener("touchstart", handleMouseDown as unknown as EventListener)
      timeline.addEventListener("touchmove", handleMouseMove as unknown as EventListener)
      timeline.addEventListener("touchend", handleMouseUp)

      return () => {
        timeline.removeEventListener("touchstart", handleMouseDown as unknown as EventListener)
        timeline.removeEventListener("touchmove", handleMouseMove as unknown as EventListener)
        timeline.removeEventListener("touchend", handleMouseUp)
      }
    }
  }, [isDragging, startX])

  return (
    <section id="experience" className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">{translatedTexts.title}</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8">
            {translatedTexts.subtitle}
          </p>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
        </motion.div>

        {/* Línea de tiempo horizontal con animación */}
        <ExperienceTimeline
          timelineRef={timelineRef}
          activeIndex={activeIndex}
          timelineYears={timelineYears}
          experienceLength={sortedExperience.length}
          handleDotClick={handleDotClick}
        />

        {/* Carrusel de experiencia */}
        <div className="relative max-w-4xl mx-auto">
          {/* Botones de navegación */}
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-16 z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              disabled={activeIndex === 0}
              className="rounded-full w-12 h-12 border-blue-700/50 bg-black/50 text-blue-500 hover:bg-blue-900/30 hover:border-blue-500 disabled:opacity-50 hover:scale-110 transition-transform"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </div>

          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-16 z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={activeIndex === sortedExperience.length - 1}
              className="rounded-full w-12 h-12 border-blue-700/50 bg-black/50 text-blue-500 hover:bg-blue-900/30 hover:border-blue-500 disabled:opacity-50 hover:scale-110 transition-transform"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Tarjetas de experiencia */}
          <ExperienceCard
            sortedExperience={sortedExperience}
            activeIndex={activeIndex}
            handleMouseDown={handleMouseDown}
            handleMouseMove={handleMouseMove}
            handleMouseUp={handleMouseUp}
          />
        </div>

        {/* Indicadores de posición con animación */}
        <motion.div
          className="flex justify-center mt-8 space-x-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {sortedExperience.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-2 rounded-full transition-all duration-300 ${index === activeIndex ? "bg-blue-500 w-8" : "bg-slate-700 w-2 hover:bg-slate-600"
                }`}
              aria-label={`${translatedTexts.viewExperience} ${index + 1}`}
            />
          ))}
        </motion.div>

        {/* Botón de autoplay */}
        <motion.div
          className="flex justify-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAutoPlay}
            className={`text-xs border-blue-700/50 ${isAutoPlaying ? "bg-blue-900/30 text-blue-300" : "bg-black/50 text-blue-500"
              } hover:bg-blue-900/30 hover:border-blue-500 transition-all`}
          >
            {isAutoPlaying ? translatedTexts.pause : translatedTexts.autoplay}
          </Button>
        </motion.div>
      </div>

      {/* Estilos adicionales para la perspectiva 3D */}
      <style jsx global>{`
        .perspective-3d {
          perspective: 1000px;
        }
      `}</style>
    </section>
  )
}
