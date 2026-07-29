"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code2, Server, Plus, Smartphone, Zap, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { FullStackProjectCard } from "./fullstack-project-card"
import { BackendProjectCard } from "./backend-project-card"
import type { Project } from "@/contexts/content/types"

interface ProjectsTabsProps {
  activeTab: string
  setActiveTab: (value: string) => void
  localProjects: {
    systems: Project[]
    mobile: Project[]
    automation: Project[]
    backend: Project[]
  }
  isLoading: boolean
  translatedTexts: {
    systems: string
    mobile: string
    automation: string
    backend: string
    viewMore: string
    repo: string
    docs: string
    [key: string]: string
  }
}

export function ProjectsTabs({ 
  activeTab, 
  setActiveTab, 
  localProjects, 
  isLoading, 
  translatedTexts 
}: ProjectsTabsProps) {
  const categories = [
    { id: "systems", icon: Layers, label: translatedTexts.systems },
    { id: "mobile", icon: Smartphone, label: translatedTexts.mobile },
    { id: "automation", icon: Zap, label: translatedTexts.automation },
    { id: "backend", icon: Server, label: translatedTexts.backend },
  ]

  return (
    <Tabs defaultValue="systems" className="w-full" onValueChange={setActiveTab}>
      <div className="flex justify-center mb-12">
        <TabsList className="bg-black/40 border border-blue-700/20 h-auto flex-wrap p-1">
          {categories.map((cat) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500 py-2 px-4"
            >
              <cat.icon className="mr-2 h-4 w-4" />
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {categories.map((cat) => (
        <TabsContent key={cat.id} value={cat.id} className="mt-0">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(localProjects[cat.id as keyof typeof localProjects] || []).slice(0, 3).map((project, index) => (
                  cat.id === "systems" || cat.id === "mobile" ? (
                    <FullStackProjectCard 
                      key={project.id} 
                      project={project} 
                      index={index} 
                    />
                  ) : (
                    <BackendProjectCard 
                      key={project.id} 
                      project={project} 
                      index={index} 
                    />
                  )
                ))}
              </div>
              
              {(localProjects[cat.id as keyof typeof localProjects] || []).length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  {translatedTexts.noProjects || "No hay proyectos en esta categoría."}
                </div>
              )}

              {(localProjects[cat.id as keyof typeof localProjects] || []).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="mt-12 flex justify-center"
                >
                  <Link 
                    href="/projects" 
                    className="group"
                    onClick={() => {
                      localStorage.setItem("activeProjectTab", cat.id);
                    }}
                  >
                    <Button
                      variant="outline"
                      className="border-blue-700/50 text-blue-500 hover:bg-blue-700/10 group-hover:border-blue-500 transition-all duration-300"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {translatedTexts.viewMore}
                    </Button>
                  </Link>
                </motion.div>
              )}
            </>
          )}
        </TabsContent>
      ))}
    </Tabs>
  )
}
