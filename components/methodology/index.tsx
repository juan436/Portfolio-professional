"use client"

import { useRef } from "react"
import { motion, useScroll, useSpring, useTransform, MotionValue } from "framer-motion"
import { useLanguage } from "@/hooks/use-language"
import { Search, Layout, Zap, TrendingUp, LucideIcon } from "lucide-react"

interface Phase {
  id: string
  icon: LucideIcon
  title: string
  description: string
  range: [number, number]
}

function MethodologyCard({
  phase, 
  index, 
  elevatorY 
}: { 
  phase: Phase, 
  index: number, 
  elevatorY: MotionValue<number> 
}) {
  const isEven = index % 2 === 0
  const Icon = phase.icon
  
  const center = (phase.range[0] + phase.range[1]) / 2
  
  const glowOpacity = useTransform(
    elevatorY,
    [phase.range[0], center, phase.range[1]],
    [0.1, 1, 0.1]
  )
  
  const borderColor = useTransform(
    elevatorY,
    [phase.range[0], center, phase.range[1]],
    ["rgba(255,255,255,0.1)", "rgba(59,130,246,0.6)", "rgba(255,255,255,0.1)"]
  )

  const autoLevitation = useTransform(
    elevatorY,
    [phase.range[0], center, phase.range[1]],
    [0, -12, 0]
  )

  const autoScale = useTransform(
    elevatorY,
    [phase.range[0], center, phase.range[1]],
    [1, 1.03, 1]
  )

  const boxShadow = useTransform(glowOpacity, (v) => `0 0 ${v * 30}px rgba(59,130,246,${v * 0.3})`)
  const interiorGlowOpacity = useTransform(glowOpacity, [0, 1], [0, 0.1])

  return (
    <div className="relative flex flex-col md:flex-row items-center">
      <motion.div
        style={{ 
          borderColor,
          boxShadow,
          y: autoLevitation,
          scale: autoScale
        }}
        whileHover={{ 
          y: -16, 
          scale: 1.05,
          transition: { type: "spring", stiffness: 400, damping: 10 }
        }}
        initial={{ opacity: 0, x: isEven ? -50 : 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, margin: "-100px" }}
        className={`w-full md:w-[45%] p-8 rounded-3xl border backdrop-blur-2xl bg-zinc-900/40 relative group overflow-hidden cursor-pointer ${
          isEven ? 'md:mr-auto' : 'md:ml-auto'
        }`}
      >
        <motion.div 
          style={{ opacity: interiorGlowOpacity }}
          className="absolute inset-0 bg-blue-500 pointer-events-none"
        />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors duration-300">
              <Icon className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-2xl font-black italic uppercase text-white tracking-tight">
              {phase.title}
            </h3>
          </div>
          <p className="text-slate-400 text-lg leading-relaxed group-hover:text-slate-300 transition-colors duration-300">
            {phase.description}
          </p>
        </div>
      </motion.div>

      <div className="md:hidden w-1 h-12 bg-blue-500/20 my-4" />
    </div>
  )
}

/**
 * Sección "Metodología" del home — 4 fases con efecto de scroll (elevación/glow) sincronizado a `scrollYProgress`.
 * Recibe: nada.
 * Produce: `MethodologyCard` por fase, con brillo/elevación que sigue el scroll dentro del contenedor.
 */
export default function Methodology() {
  const { t } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)

  const translatedTexts = {
    title: String(t("methodology.title")),
    subtitle: String(t("methodology.subtitle")),
  }
  const translatedPhases: Phase[] = [
    { id: "phase1", icon: Search, title: String(t("methodology.phases.phase1.title")), description: String(t("methodology.phases.phase1.description")), range: [0, 0.25] },
    { id: "phase2", icon: Layout, title: String(t("methodology.phases.phase2.title")), description: String(t("methodology.phases.phase2.description")), range: [0.25, 0.5] },
    { id: "phase3", icon: Zap, title: String(t("methodology.phases.phase3.title")), description: String(t("methodology.phases.phase3.description")), range: [0.5, 0.75] },
    { id: "phase4", icon: TrendingUp, title: String(t("methodology.phases.phase4.title")), description: String(t("methodology.phases.phase4.description")), range: [0.75, 1] },
  ]

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  })

  const elevatorY = useSpring(scrollYProgress, {
    stiffness: 800,
    damping: 45,
    mass: 0.1
  })

  const yPercent = useTransform(elevatorY, [0, 1], ["0%", "100%"])

  return (
    <section 
      id="methodology" 
      ref={containerRef}
      className="py-24 bg-black relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10" >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16 relative z-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            {translatedTexts.title}
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8">
            {translatedTexts.subtitle}
          </p>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-blue-900/30 hidden md:block" />

          <motion.div 
            style={{ top: yPercent }}
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_40px_10px_#3b82f6] z-30 hidden md:block"
          />

          <div className="space-y-32">
            {translatedPhases.map((phase, index) => (
              <MethodologyCard 
                key={phase.id} 
                phase={phase} 
                index={index} 
                elevatorY={elevatorY} 
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
