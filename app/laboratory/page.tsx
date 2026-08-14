"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useLanguage } from "@/hooks/use-language"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { LabExpedienteCard, type LabExpedienteProject } from "@/components/laboratory/lab-expediente-card"
import { LabIntro } from "@/components/laboratory/lab-intro"

const PAGE_SIZE = 2

const slideVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction >= 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction >= 0 ? -60 : 60 }),
}

export default function LaboratoryPage() {
  const { language, t } = useLanguage()
  const statusLabels: Record<string, string> = {
    testing: String(t("laboratory.detail.statusTesting") || "En pruebas"),
    completed: String(t("laboratory.detail.statusCompleted") || "Completado"),
    discontinued: String(t("laboratory.detail.statusDiscontinued") || "Descontinuado"),
    evolved: String(t("laboratory.detail.statusEvolved") || "Evolucionó a proyecto real"),
  }
  const fieldLabels = {
    hipotesis: String(t("laboratory.card.hipotesis") || "Hipótesis"),
    metodo: String(t("laboratory.card.metodo") || "Método"),
    hallazgo: String(t("laboratory.card.hallazgo") || "Hallazgo"),
    siguiente: String(t("laboratory.card.siguiente") || "Próximo paso"),
  }
  const fileLabel = String(t("laboratory.card.fileLabel") || "Expediente Nº")
  const stampRingLabel = String(t("laboratory.card.stampRing") || "EXPERIMENTO · EN CURSO ·")
  const viewFullLabel = String(t("laboratory.card.viewFull") || "Ver expediente completo")
  const naLabel = String(t("laboratory.card.notAvailable") || "N/D")
  const pageTitle = String(t("laboratory.title") || "Laboratorio R&D")
  const pageSubtitle = String(t("laboratory.subtitle") || "")
  const legendHeading = String(t("laboratory.legendHeading") || "Cómo leer los estados")
  const [labProjects, setLabProjects] = useState<LabExpedienteProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pageIndex, setPageIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  const totalPages = Math.max(1, Math.ceil(labProjects.length / PAGE_SIZE))
  const visibleProjects = labProjects.slice(pageIndex * PAGE_SIZE, pageIndex * PAGE_SIZE + PAGE_SIZE)

  const goPrev = () => {
    if (pageIndex === 0) return
    setDirection(-1)
    setPageIndex((p) => p - 1)
  }
  const goNext = () => {
    if (pageIndex >= totalPages - 1) return
    setDirection(1)
    setPageIndex((p) => p + 1)
  }

  useEffect(() => {
    const fetchLabProjects = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/projects?category=laboratorio')
        const result = await response.json()

        if (result.success && Array.isArray(result.data)) {
          setLabProjects(result.data)
        }
      } catch (error) {
        console.error('Error fetching lab projects:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLabProjects()
  }, [])

  return (
    <main className="min-h-screen bg-black flex flex-col">
      <Navbar />

      <div className="container mx-auto px-6 pt-20 pb-8 mt-16 flex-grow relative">
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />

        <LabIntro title={pageTitle} subtitle={pageSubtitle} legendHeading={legendHeading} statusLabels={statusLabels} />

        {isLoading ? (
          <div className="text-center py-12 relative z-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          </div>
        ) : labProjects.length > 0 ? (
          <div className="relative z-10">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={pageIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {visibleProjects.map((proj, index) => (
                  <LabExpedienteCard
                    key={proj._id}
                    project={proj}
                    fileNumber={pageIndex * PAGE_SIZE + index + 1}
                    languageCode={language.code}
                    statusLabels={statusLabels}
                    fieldLabels={fieldLabels}
                    fileLabel={fileLabel}
                    stampRingLabel={stampRingLabel}
                    viewFullLabel={viewFullLabel}
                    naLabel={naLabel}
                  />
                ))}
              </motion.div>
            </AnimatePresence>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-6 mt-10">
                <button
                  onClick={goPrev}
                  disabled={pageIndex === 0}
                  aria-label="Anterior"
                  className="rounded-full w-12 h-12 border border-blue-700/50 bg-black/50 text-blue-500 hover:bg-blue-900/30 hover:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-black/50 disabled:hover:border-blue-700/50 flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="font-mono text-xs text-slate-500 tabular-nums">
                  {pageIndex + 1} / {totalPages}
                </span>
                <button
                  onClick={goNext}
                  disabled={pageIndex >= totalPages - 1}
                  aria-label="Siguiente"
                  className="rounded-full w-12 h-12 border border-blue-700/50 bg-black/50 text-blue-500 hover:bg-blue-900/30 hover:border-blue-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-black/50 disabled:hover:border-blue-700/50 flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-white/5 rounded-2xl bg-white/5 relative z-10">
            <p className="text-slate-500 italic">No hay experimentos públicos en este momento. Vuelve pronto.</p>
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
