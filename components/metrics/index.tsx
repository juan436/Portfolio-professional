"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { useLanguage } from "@/hooks/use-language"
import { fetchStatTypesSummary, type StatTypeSummary } from "@/services/api/stat-types"

interface Metric {
  id: string
  value: string | number
  suffix?: string
  prefix?: string
  gradient: string
}

const metricsData: Metric[] = [
  { id: "HOURS_SAVED", value: 1000, prefix: "+", gradient: "from-blue-400 to-blue-600" },
  { id: "PROCESS_ACCELERATION", value: 10, suffix: "x", gradient: "from-cyan-400 to-blue-500" },
  { id: "SYSTEM_AVAILABILITY", value: 99.9, suffix: "%", gradient: "from-blue-500 to-indigo-600" },
  { id: "AUTONOMOUS_OPERATION", value: "24/7", gradient: "from-blue-600 to-blue-800" },
]

// Combina la data fija de marketing con el total real acumulado (si ya hay
// alguna métrica de proyecto/automatización marcada con esa categoría) —
// mientras no haya datos reales, se ve exactamente igual que siempre.
function applyRealTotals(base: Metric[], summary: StatTypeSummary[]): Metric[] {
  return base.map((metric) => {
    const real = summary.find((s) => s.key === metric.id && s.count > 0)
    if (!real) return metric
    return {
      ...metric,
      value: real.total,
      prefix: real.prefix || metric.prefix,
      suffix: real.suffix || metric.suffix,
    }
  })
}

/**
 * Sección de métricas acumuladas del home (4 cifras fijas de marketing, reemplazadas por datos reales si existen).
 * Recibe: nada.
 * Procesa: trae `/api/stat-types/summary` y mergea sobre `metricsData` (`applyRealTotals`) solo donde hay dato real.
 * Produce: 4 `MetricCard` con animación de conteo al entrar en viewport.
 */
export default function MetricsSection() {
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [metrics, setMetrics] = useState<Metric[]>(metricsData)

  useEffect(() => {
    setMounted(true)
    fetchStatTypesSummary().then((summary) => {
      if (summary.length > 0) setMetrics(applyRealTotals(metricsData, summary))
    })
  }, [])

  return (
    <section className="py-24 relative overflow-hidden bg-black border-y border-white/5">
      {/* Luz de fondo sutil */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-900/5 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, index) => (
            <MetricCard
              key={metric.id}
              metric={metric}
              label={mounted ? String(t(`metrics.${metric.id}`)) : `metrics.${metric.id}`}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

/** Card individual de métrica — animación de conteo (número) desde 0 al entrar en viewport. */
function MetricCard({ metric, label, index }: { metric: Metric; label: string; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(cardRef, { once: true, margin: "-100px" })
  const [displayValue, setDisplayValue] = useState<string | number>(typeof metric.value === 'string' ? "" : 0)

  useEffect(() => {
    if (isInView) {
      if (typeof metric.value === 'number') {
        let startTime: number | null = null
        const duration = 2000
        const startValue = 0
        const endValue = metric.value

        const animate = (timestamp: number) => {
          if (!startTime) startTime = timestamp
          const progress = Math.min((timestamp - startTime) / duration, 1)
          const currentCount = progress * (endValue - startValue) + startValue
          
          setDisplayValue(currentCount)

          if (progress < 1) {
            requestAnimationFrame(animate)
          } else {
            setDisplayValue(endValue)
          }
        }
        requestAnimationFrame(animate)
      } else {
        // Para valores tipo string como "24/7"
        setDisplayValue(metric.value)
      }
    }
  }, [isInView, metric.value])

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { 
        opacity: 1, 
        y: [0, -8, 0],
        rotateX: [2, -2, 2],
        rotateY: [-2, 2, -2],
      } : {}}
      transition={isInView ? {
        opacity: { duration: 0.8, delay: index * 0.1 },
        y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 },
        rotateX: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 },
        rotateY: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }
      } : {}}
      style={{ perspective: 1000 }}
      className="relative group p-10 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-3xl overflow-hidden select-none cursor-default"
    >
      {/* Spotlight Automático Suave */}
      <motion.div 
        animate={{
          background: [
            "radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.08), transparent 70%)",
            "radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.08), transparent 70%)",
            "radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.08), transparent 70%)",
          ]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 z-0 pointer-events-none" 
      />

      <div className="relative z-10 text-center">
        <div className={`text-4xl md:text-6xl font-black italic tracking-tighter bg-gradient-to-r ${metric.gradient} bg-clip-text text-transparent mb-4 leading-tight pr-4`}>
          {metric.prefix}
          {typeof displayValue === 'number' 
            ? displayValue.toLocaleString(undefined, { 
                maximumFractionDigits: metric.value.toString().includes('.') ? 1 : 0,
                minimumFractionDigits: metric.value.toString().includes('.') ? 1 : 0
              })
            : displayValue
          }
          {metric.suffix}
        </div>
        <p className="text-slate-400 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase max-w-[150px] mx-auto leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
          {label}
        </p>
      </div>
    </motion.div>
  )
}
