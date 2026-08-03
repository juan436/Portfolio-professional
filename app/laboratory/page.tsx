"use client"

import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useLanguage } from "@/hooks/use-language"
import LanguageSwitcher from "@/components/language-switcher"
import Footer from "@/components/footer"
import { LabProjectCard, type LabProject } from "@/components/laboratory/lab-project-card"

export default function LaboratoryPage() {
  const { language, t } = useLanguage()
  const statusLabels: Record<string, string> = {
    testing: String(t("laboratory.detail.statusTesting") || "En pruebas"),
    completed: String(t("laboratory.detail.statusCompleted") || "Completado"),
    discontinued: String(t("laboratory.detail.statusDiscontinued") || "Descontinuado"),
    evolved: String(t("laboratory.detail.statusEvolved") || "Evolucionó a proyecto real"),
  }
  const [labProjects, setLabProjects] = useState<LabProject[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLabProjects = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/projects?category=laboratory')
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md shadow-lg">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="bg-transparent border-0 cursor-pointer" aria-label="Home">
              <svg
                width="80"
                height="48"
                viewBox="0 0 50 30"
                className="hover:scale-105 transition-transform duration-300"
              >
                <rect
                  x="1"
                  y="1"
                  width="48"
                  height="28"
                  rx="6"
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                  strokeOpacity="0.3"
                />
                <path
                  d="M12 7v10c0 2-1 3-3 3s-3-1-3-3"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M18 7l4 13 4-13"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path d="M30 17h12" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
                <text x="30" y="13" fontFamily="monospace" fontSize="7" fontWeight="bold" fill="#e2e8f0">
                  DEV
                </text>
                <path d="M3 15h2 M45 15h2" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.6" />
                <circle cx="5" cy="15" r="1" fill="#3b82f6" />
                <circle cx="45" cy="15" r="1" fill="#3b82f6" />
              </svg>
            </Link>
            <LanguageSwitcher />
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-6 py-20 mt-16 flex-grow relative">
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="mb-8 relative z-10">
          <Link href="/" className="inline-flex items-center text-blue-500 hover:text-blue-400 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {String(t("projects.backToHome") || "Volver")}
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 relative z-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Laboratorio R&D</h1>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Espacio de experimentación técnica donde desarrollo prototipos, arquitecturas emergentes y soluciones de IA.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12 relative z-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          </div>
        ) : labProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
            {labProjects.map((proj, index) => (
              <LabProjectCard
                key={proj._id || index}
                project={proj}
                index={index}
                languageCode={language.code}
                statusLabels={statusLabels}
              />
            ))}
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
