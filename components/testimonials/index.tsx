"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { motion, useMotionValue, useAnimationFrame } from "framer-motion"
import { useLanguage } from "@/hooks/use-language"
import { Star, Quote } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Testimonial {
  content: string
  author: string
  role: string
  avatar?: string
}

/**
 * Sección "Testimonios" del home — carrusel infinito con drag + auto-scroll.
 * Recibe: `items` (testimonios `approved` de Mongo, traídos server-side por
 * `getApprovedTestimonials` en app/[locale]/page.tsx). Antes leía 4 testimonios
 * ficticios de `testimonials.items` en los translation.json.
 * Produce: carrusel arrastrable con loop, o `null` si no hay testimonios.
 */
export default function Testimonials({ items }: { items: Testimonial[] }) {
  const { t } = useLanguage()
  const [isPaused, setIsPaused] = useState(false)
  const constraintsRef = useRef(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const halfWidthRef = useRef(0)
  const x = useMotionValue(0)

  const testimonials = items

  const title = String(t("testimonials.title") || "CASOS DE ÉXITO VERIFICADOS")
  const subtitle = String(t("testimonials.subtitle") || "Lo que dicen los líderes que han confiado en mi arquitectura técnica.")

  // Duplicamos los testimonios para lograr el efecto de carrusel infinito (seamless loop)
  const duplicatedTestimonials = useMemo(() => [...testimonials, ...testimonials], [testimonials])

  useEffect(() => {
    if (trackRef.current) {
      halfWidthRef.current = trackRef.current.scrollWidth / 2
    }
  }, [duplicatedTestimonials])

  // Auto-scroll continuo sobre el mismo motion value que usa el drag — al soltar
  // un arrastre, sigue desde ahí en vez de saltar de vuelta al inicio del keyframe.
  useAnimationFrame((_, delta) => {
    if (isPaused || halfWidthRef.current === 0) return
    let next = x.get() - (delta / 1000) * 40
    if (next <= -halfWidthRef.current) next += halfWidthRef.current
    if (next > 0) next -= halfWidthRef.current
    x.set(next)
  })

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Sin testimonios aprobados no hay sección: nada de encabezado huérfano
  // "Casos de Éxito Verificados" sobre un carrusel vacío. El CTA del Hero que
  // apunta acá también se oculta (prop `hasTestimonials`).
  if (testimonials.length === 0) return null

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden bg-black">
      {/* Background Glows (Blue Spectrum) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full z-0 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-900/10 blur-[120px] rounded-full z-0 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            {title}
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8 text-lg leading-relaxed">
            {subtitle}
          </p>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-8" />
        </motion.div>
      </div>

      {/* Infinite Marquee Carousel - Solo renderiza si hay testimonios */}
      {testimonials.length > 0 && (
        <div
          ref={constraintsRef}
          className="container mx-auto px-6 relative flex overflow-hidden py-10 select-none cursor-grab active:cursor-grabbing"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <motion.div
            ref={trackRef}
            className="flex flex-nowrap gap-8 pr-8"
            style={{ x }}
            drag="x"
            dragConstraints={constraintsRef}
            dragElastic={0.05}
            onDragStart={() => setIsPaused(true)}
            onDragEnd={() => setIsPaused(false)}
          >
            {duplicatedTestimonials.map((testimonial, idx) => (
              <div 
                key={`${testimonial.author}-${idx}`}
                className="flex-shrink-0 w-[320px] md:w-[450px] p-8 rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-white/5 flex flex-col justify-between transition-all duration-300 hover:border-blue-500/30 hover:bg-zinc-800/50 group/card"
              >
                <div>
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="fill-blue-500 text-blue-500" />
                    ))}
                  </div>
                  <div className="relative">
                    <Quote className="absolute -top-4 -left-4 w-10 h-10 text-blue-500/10 z-0" />
                    <p className="text-slate-300 text-lg leading-relaxed relative z-10 italic font-inter">
                      "{testimonial.content}"
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-blue-600/20 group-hover/card:border-blue-500/50 transition-colors">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                    <AvatarFallback className="bg-blue-600/20 text-blue-400 font-bold text-lg">
                      {getInitials(testimonial.author)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-lg leading-tight">{testimonial.author}</span>
                    <span className="text-blue-400 text-sm font-medium">{testimonial.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Side Fades para suavizar la transición visual en los bordes del contenedor */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-20 pointer-events-none" />
        </div>
      )}
    </section>
  )
}
