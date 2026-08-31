"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, useMotionValue, useAnimationFrame } from "framer-motion"
import { Quote, Star } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { RawTestimonial } from "@/services/api/testimonials"

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

function TestimonialCard({ testimonial }: { testimonial: RawTestimonial }) {
  return (
    <div className="flex-shrink-0 w-[88%] sm:w-[47%] min-h-[360px] p-8 rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-white/5 flex flex-col justify-between transition-all duration-300 hover:border-blue-500/30 hover:bg-zinc-800/50">
      <div>
        <div className="flex gap-1 mb-5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className={i < (testimonial.rating || 5) ? "fill-blue-500 text-blue-500" : "text-white/10"}
            />
          ))}
        </div>
        <div className="relative">
          <Quote className="absolute -top-4 -left-4 w-10 h-10 text-blue-500/10 z-0" />
          <p className="text-slate-300 text-lg leading-relaxed relative z-10 italic">
            "{testimonial.content}"
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <Avatar className="h-14 w-14 border-2 border-blue-600/20">
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
  )
}

/**
 * Carrusel infinito de testimonios (detalle de automatización) — drag + auto-scroll continuo.
 * Recibe: `testimonials: RawTestimonial[]`.
 * Produce: `null` si vacío; carrusel arrastrable con loop si hay 2+; card única centrada si hay solo 1.
 */
export function TestimonialCarousel({ testimonials }: { testimonials: RawTestimonial[] }) {
  const [isPaused, setIsPaused] = useState(false)
  const constraintsRef = useRef(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const halfWidthRef = useRef(0)
  const x = useMotionValue(0)

  const duplicated = useMemo(
    () => (testimonials.length > 1 ? [...testimonials, ...testimonials] : testimonials),
    [testimonials]
  )

  useEffect(() => {
    if (trackRef.current) {
      halfWidthRef.current = trackRef.current.scrollWidth / 2
    }
  }, [duplicated])

  useAnimationFrame((_, delta) => {
    if (isPaused || halfWidthRef.current === 0) return
    let next = x.get() - (delta / 1000) * 40
    if (next <= -halfWidthRef.current) next += halfWidthRef.current
    if (next > 0) next -= halfWidthRef.current
    x.set(next)
  })

  if (!testimonials || testimonials.length === 0) return null

  if (testimonials.length === 1) {
    return (
      <div className="flex justify-center">
        <TestimonialCard testimonial={testimonials[0]} />
      </div>
    )
  }

  return (
    <div className="relative -mx-6 sm:-mx-10">
      <div
        ref={constraintsRef}
        className="relative flex overflow-hidden py-4 select-none cursor-grab active:cursor-grabbing"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div
          ref={trackRef}
          className="flex flex-nowrap gap-8 px-6 sm:px-10"
          style={{ x }}
          drag="x"
          dragConstraints={constraintsRef}
          dragElastic={0.05}
          onDragStart={() => setIsPaused(true)}
          onDragEnd={() => setIsPaused(false)}
        >
          {duplicated.map((testimonial, idx) => (
            <TestimonialCard key={`${testimonial._id}-${idx}`} testimonial={testimonial} />
          ))}
        </motion.div>

        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black to-transparent z-20 pointer-events-none" />
      </div>
    </div>
  )
}
