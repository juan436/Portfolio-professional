"use client"

import { useState, useEffect } from "react"
import Footer from "@/components/footer"
import { useLanguage } from "@/hooks/use-language"
import { useContent } from "@/contexts/content"
import { ProjectHeader } from "@/components/projects/project-header"
import { BackendProjectCard } from "@/components/projects/backend-project-card"
import type { Project } from "@/contexts/content/types"
export default function BackendProjects() {
  const { t } = useLanguage();
  const { content } = useContent();
  const [backendProjects, setBackendProjects] = useState<Project[]>([]);

  useEffect(() => {
    // Usar el contenido del contexto
    if (content?.projects?.backend) {
      setBackendProjects(content.projects.backend);
    }
  }, [content.projects]);

  return (
    <main className="min-h-screen bg-black">
      <section className="pt-32 pb-20 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
          <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-blue-600 to-transparent opacity-20" />
          <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-blue-600 to-transparent opacity-20" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <ProjectHeader 
            title={String(t("projects.backend.title"))} 
            description={String(t("projects.backend.description"))} 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {backendProjects.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <p className="text-slate-400">{String(t("projects.noProjects"))}</p>
              </div>
            ) : (
              [...backendProjects]
                .sort((a, b) => b.id - a.id)
                .map((project, index) => (
                  <BackendProjectCard 
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
