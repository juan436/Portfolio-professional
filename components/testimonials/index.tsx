"use client"

import { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/hooks/use-language"
import { Star, Quote } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Testimonial {
  content: string
  author: string
  role: string
  avatar?: string
}

export default function Testimonials() {
  const { t } = useLanguage()
  const [isPaused, setIsPaused] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  // Usamos returnObjects: true para obtener el array de testimonios desde i18n
  const testimonials = useMemo(() => {
    if (!isMounted) return [];
    const items = t("testimonials.items", { returnObjects: true });
    return Array.isArray(items) ? items as Testimonial[] : [];
  }, [t, isMounted])

  const title = String(t("testimonials.title") || "CASOS DE ÉXITO VERIFICADOS")
  const subtitle = String(t("testimonials.subtitle") || "Lo que dicen los líderes que han confiado en mi arquitectura técnica.")

  // Duplicamos los testimonios para lograr el efecto de carrusel infinito (seamless loop)
  const duplicatedTestimonials = useMemo(() => [...testimonials, ...testimonials], [testimonials])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Siempre renderizamos la sección para evitar saltos en la hidratación (Hydration Mismatch)
  // Pero el contenido dinámico solo se muestra cuando está montado
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
            {isMounted ? title : "CASOS DE ÉXITO VERIFICADOS"}
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8 text-lg leading-relaxed">
            {isMounted ? subtitle : "..."}
          </p>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-8" />
        </motion.div>
      </div>

      {/* Infinite Marquee Carousel - Solo renderiza si hay testimonios y está montado */}
      {isMounted && testimonials.length > 0 && (
        <div 
          className="relative flex overflow-hidden py-10 select-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <motion.div 
            className="flex flex-nowrap gap-8 pr-8"
            animate={{
              x: isPaused ? undefined : ["0%", "-50%"],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 40,
                ease: "linear",
              },
            }}
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
        </div>
      )}

      {/* Side Fades para suavizar la transición visual en los bordes */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-20 pointer-events-none" />
    </section>
  )
}
