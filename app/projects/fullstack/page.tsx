"use client"

import Link from "next/link"
import Footer from "@/components/footer"
import { useState, useEffect } from "react"
import { useLanguage } from "@/hooks/use-language"
import { useContent } from "@/contexts/content"
import { ProjectHeader } from "@/components/projects/project-header"
import { FullStackProjectCard } from "@/components/projects/fullstack-project-card"
import type { Project } from "@/contexts/content/types"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import LanguageSwitcher from "@/components/language-switcher"
export default function FullStackProjects() {
  const { t } = useLanguage();
  const { content } = useContent();
  const [fullStackProjects, setFullStackProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Usar el contenido del contexto
    if (content?.projects?.fullstack) {
      setFullStackProjects(content.projects.fullstack);
    }
  }, [content.projects]);

  return (
    <main className="min-h-screen bg-black">
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
            <div className="flex items-center justify-between">
              <Button
                asChild
                variant="ghost"
                className="mr-4 text-blue-500 hover:text-blue-400 hover:bg-blue-900/20 -ml-4"
              >
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Link>
              </Button>
              <LanguageSwitcher />
            </div>
          </div>
        </nav>
      </header>

      <section className="pt-32 pb-20 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
          <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-blue-600 to-transparent opacity-20" />
          <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-blue-600 to-transparent opacity-20" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <ProjectHeader 
            title={String(t("projects.fullstack.title"))} 
            description={String(t("projects.fullstack.description"))}           />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fullStackProjects.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <p className="text-slate-400">{String(t("projects.noProjects"))}</p>
              </div>
            ) : (
              [...fullStackProjects]
                .sort((a, b) => b.id - a.id)
                .map((project, index) => (
                  <FullStackProjectCard 
                    key={project.id} 
                    project={project} 
                    index={index} 
                  />
                ))
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
