"use client"

import { motion } from "framer-motion"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"

interface Metric {
  label: string
  value: string
}

const CAROUSEL_THRESHOLD = 5

// El valor puede ser corto ("40%", "24h") o una frase más larga — el tamaño
// de letra se adapta al largo real para que nunca desborde ni tape la card.
function valueSizeClass(value: string): string {
  if (value.length <= 10) return "text-3xl md:text-4xl"
  if (value.length <= 20) return "text-lg md:text-xl"
  return "text-sm md:text-base"
}

function BigNumberTile({ label, value, index }: { label: string; value: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      viewport={{ once: true }}
      className="relative h-full min-h-[140px] p-6 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-3xl text-center overflow-hidden flex flex-col justify-center"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10">
        <p
          className={`font-black italic tracking-tighter bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-2 leading-tight break-words ${valueSizeClass(value)}`}
        >
          {value}
        </p>
        <p className="text-slate-400 text-[10px] font-bold tracking-[0.15em] uppercase leading-relaxed">
          {label}
        </p>
      </div>
    </motion.div>
  )
}

export function TestimonialMetrics({ metrics }: { metrics: Metric[] }) {
  if (!metrics || metrics.length === 0) return null

  // Pocas estadísticas: se muestran centradas, sin carrusel (no tiene sentido
  // arrastrar 2-3 cards). Solo a partir de 6 aparece el carrusel con flechas.
  if (metrics.length <= CAROUSEL_THRESHOLD) {
    return (
      <div className="flex flex-wrap justify-center gap-6">
        {metrics.map((metric, i) => (
          <div key={i} className="w-[170px] sm:w-[200px]">
            <BigNumberTile label={metric.label} value={metric.value} index={i} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <Carousel opts={{ align: "start" }} className="w-full">
      <CarouselContent className="-ml-8">
        {metrics.map((metric, i) => (
          <CarouselItem key={i} className="pl-8 basis-1/2 sm:basis-1/3 md:basis-1/4">
            <BigNumberTile label={metric.label} value={metric.value} index={i} />
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious className="-left-8 sm:-left-12 border-blue-700/50 bg-black/70 text-blue-400 hover:bg-blue-700/20 hover:text-blue-300" />
      <CarouselNext className="-right-8 sm:-right-12 border-blue-700/50 bg-black/70 text-blue-400 hover:bg-blue-700/20 hover:text-blue-300" />
    </Carousel>
  )
}
