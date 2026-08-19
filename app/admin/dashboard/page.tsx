"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import AdminLayout from "@/components/admin/layout/admin-layout"
import ProjectsManager from "@/components/admin/managers/projects-manager"
import ContentEditor from "@/components/admin/managers/content-editor"
import ImageManager from "@/components/admin/managers/image-manager"
import SkillsManager from "@/components/admin/managers/skills-manager"
import ExperienceManager from "@/components/admin/managers/experience-manager"
import TestimonialsManager from "@/components/admin/managers/testimonials-manager"
import ProjectStatsManager from "@/components/admin/managers/project-stats-manager"
import CertificatesManager from "@/components/admin/managers/certificates-manager"
import BlogManager from "@/components/admin/managers/blog-manager"
import { Code, FileText, FileImage, User, Briefcase, Quote, BarChart3, Award, Newspaper } from "lucide-react"

const TABS = ["projects", "skills", "experience", "content", "images", "testimonials", "stats", "certificates", "blog"]

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("projects")
  const searchParams = useSearchParams()

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab && TABS.includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleTabChange = (value: string) => {
    setActiveTab(value)

    const url = new URL(window.location.href)
    url.searchParams.set("tab", value)

    url.searchParams.delete("type")
    url.searchParams.delete("section")

    window.history.replaceState({}, "", url.toString())
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16">
            <div className="w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-slate-400">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="bg-black/40 border border-blue-700/20 w-full justify-start flex-wrap h-auto">
              <TabsTrigger
                value="projects"
                className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500 flex items-center"
              >
                <Code className="mr-2 h-4 w-4" />
                Proyectos
              </TabsTrigger>
              <TabsTrigger
                value="skills"
                className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500 flex items-center"
              >
                <Code className="mr-2 h-4 w-4" />
                Habilidades
              </TabsTrigger>
              <TabsTrigger
                value="experience"
                className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500 flex items-center"
              >
                <Briefcase className="mr-2 h-4 w-4" />
                Experiencia
              </TabsTrigger>
              <TabsTrigger
                value="content"
                className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500 flex items-center"
              >
                <FileText className="mr-2 h-4 w-4" />
                Contenido
              </TabsTrigger>
              <TabsTrigger
                value="images"
                className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500 flex items-center"
              >
                <FileImage className="mr-2 h-4 w-4" />
                Imágenes
              </TabsTrigger>
              <TabsTrigger
                value="testimonials"
                className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500 flex items-center"
              >
                <Quote className="mr-2 h-4 w-4" />
                Testimonios
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500 flex items-center"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Métricas
              </TabsTrigger>
              <TabsTrigger
                value="certificates"
                className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500 flex items-center"
              >
                <Award className="mr-2 h-4 w-4" />
                Certificados
              </TabsTrigger>
              <TabsTrigger
                value="blog"
                className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500 flex items-center"
              >
                <Newspaper className="mr-2 h-4 w-4" />
                Blog
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="bg-black/20 border border-blue-700/20 rounded-lg p-6">
          {activeTab === "projects" && <ProjectsManager />}
          {activeTab === "skills" && <SkillsManager />}
          {activeTab === "experience" && <ExperienceManager />}
          {activeTab === "content" && <ContentEditor />}
          {activeTab === "images" && <ImageManager />}
          {activeTab === "testimonials" && <TestimonialsManager />}
          {activeTab === "stats" && <ProjectStatsManager />}
          {activeTab === "certificates" && <CertificatesManager />}
          {activeTab === "blog" && <BlogManager />}
        </div>
      </div>
    </AdminLayout>
  )
}
