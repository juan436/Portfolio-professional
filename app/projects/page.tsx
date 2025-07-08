"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code2, Server, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/hooks/use-language"
import { useContent } from "@/contexts/content"
import LanguageSwitcher from "@/components/language-switcher"
import Footer from "@/components/footer"
import { FullStackProjectCard } from "@/components/projects/fullstack-project-card"
import { BackendProjectCard } from "@/components/projects/backend-project-card"
export default function ProjectsPage() {
  const { t } = useLanguage()
  const { content } = useContent()
  const [activeTab, setActiveTab] = useState("fullstack")
  const [projects, setProjects] = useState({
    fullstack: content.projects.fullstack || [],
    backend: content.projects.backend || [],
  })
  const [isLoading, setIsLoading] = useState(true)

  // Cargar proyectos desde el contexto
  useEffect(() => {
    setProjects({
      fullstack: content.projects.fullstack || [],
      backend: content.projects.backend || [],
    })
    setIsLoading(false)
  }, [content.projects])

  // Usar el parámetro de consulta o localStorage para determinar la pestaña activa
  useEffect(() => {
    // Verificar si estamos en el navegador
    if (typeof window !== "undefined") {
      // Primero intentar leer desde localStorage
      const savedTab = localStorage.getItem("activeProjectTab")
      if (savedTab && (savedTab === "fullstack" || savedTab === "backend")) {
        setActiveTab(savedTab)
        // Limpiar después de usar
        localStorage.removeItem("activeProjectTab")
        return
      }
      
      // Si no hay valor en localStorage, intentar leer desde URL
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get("tab")
      if (tabParam && (tabParam === "fullstack" || tabParam === "backend")) {
        setActiveTab(tabParam)
      }
    }
  }, [])

  return (
    <main className="min-h-screen bg-black flex flex-col">
      {/* Simplified Header */}
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
                {/* Background shape */}
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

                {/* J letter */}
                <path
                  d="M12 7v10c0 2-1 3-3 3s-3-1-3-3"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* V letter */}
                <path
                  d="M18 7l4 13 4-13"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />

                {/* Underscore and DEV */}
                <path d="M30 17h12" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
                <text x="30" y="13" fontFamily="monospace" fontSize="7" fontWeight="bold" fill="#e2e8f0">
                  DEV
                </text>

                {/* Tech circuit lines */}
                <path d="M3 15h2 M45 15h2" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.6" />
                <circle cx="5" cy="15" r="1" fill="#3b82f6" />
                <circle cx="45" cy="15" r="1" fill="#3b82f6" />
              </svg>
            </Link>

            {/* Language Switcher */}
            <LanguageSwitcher />
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-6 py-20 mt-16 flex-grow">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-500 hover:text-blue-400 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {String(t("projects.backToHome"))}
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{String(t("projects.title"))}</h1>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
        </motion.div>

        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-12">
            <TabsList className="bg-black/40 border border-blue-700/20">
              <TabsTrigger
                value="fullstack"
                className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500"
              >
                <Code2 className="mr-2 h-4 w-4" />
                {String(t("projects.fullstack"))}
              </TabsTrigger>
              <TabsTrigger
                value="backend"
                className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500"
              >
                <Server className="mr-2 h-4 w-4" />
                {String(t("projects.backend"))}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="fullstack" className="mt-0">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                <p className="mt-4 text-slate-400">{String(t("projects.loading"))}</p>
              </div>
            ) : projects.fullstack.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.fullstack
                  .sort((a, b) => b.id - a.id) // Ordenar por ID descendente
                  .map((project, index) => (
                    <FullStackProjectCard key={project.id} project={project} index={index} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400">{String(t("projects.noProjects"))}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="backend" className="mt-0">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                <p className="mt-4 text-slate-400">{String(t("projects.loading"))}</p>
              </div>
            ) : projects.backend.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.backend
                  .sort((a, b) => b.id - a.id) // Ordenar por ID descendente
                  .map((project, index) => (
                    <BackendProjectCard key={project.id} project={project} index={index} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400">{String(t("projects.noProjects"))}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  )
}
