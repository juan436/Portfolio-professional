"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { LabProjectCard, type LabProject } from "./lab-project-card"

export default function Laboratory() {
  const { language, t } = useLanguage()
  const statusLabels: Record<string, string> = {
    testing: String(t("laboratory.detail.statusTesting") || "En pruebas"),
    completed: String(t("laboratory.detail.statusCompleted") || "Completado"),
    discontinued: String(t("laboratory.detail.statusDiscontinued") || "Descontinuado"),
    evolved: String(t("laboratory.detail.statusEvolved") || "Evolucionó a proyecto real"),
  }
  const viewMoreLabel = String(t("laboratory.viewMore") || "Ver todos los experimentos")
  const [labProjects, setLabProjects] = useState<LabProject[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsMounted(true)

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

  if (!isMounted) return null;

  return (
    <section id="laboratory" className="py-24 bg-gradient-to-b from-black to-zinc-950 relative overflow-hidden">
      {/* Fondo de neones decorativos */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Laboratorio R&D</h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Espacio de experimentación técnica donde desarrollo prototipos, arquitecturas emergentes y soluciones de IA.
          </p>
          <div className="w-20 h-1 bg-blue-600 mb-8 mx-auto" />
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : labProjects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mt-12 flex justify-center"
            >
              <Link
                href="/laboratory"
                className="group inline-flex items-center border border-blue-700/50 text-blue-500 hover:bg-blue-700/10 hover:border-blue-500 transition-all duration-300 rounded-md px-4 py-2 text-sm font-medium"
              >
                {viewMoreLabel}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </>
        ) : (
          <div className="text-center py-20 border border-dashed border-white/5 rounded-2xl bg-white/5">
            <p className="text-slate-500 italic">No hay experimentos públicos en este momento. Vuelve pronto.</p>
          </div>
        )}
      </div>
    </section>
  );
}
