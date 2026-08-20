"use client"

import { useState, useEffect, useRef, type ReactNode } from "react"
import ContentContext, { ContentContextType } from "./content-context"
import { Content } from "./types"

import {
  fetchContent, fetchProjects, fetchExperiences, fetchSkills, fetchOtherSkills
} from "@/services/api"

const emptyContent: Content = {
  hero: { title: "", subtitle: "", description: "", profileImage: "", translations: {} },
  about: { paragraph1: "", paragraph2: "", paragraph3: "", translations: {} },
  services: [],
  projects: { web: [], mobile: [], infra_backend: [] },
  skills: { frontend: [], backend: [], database: [], devops: [] },
  otherSkills: [],
  contact: { email: "", phone: "", location: "", translations: {} },
  experience: []
}

// Caché de lectura para el sitio público (home, Footer, /contact) y para las
// pocas pantallas de Admin que todavía leen de acá (image-manager.tsx, solo
// lectura). Las mutaciones viven todas en Server Actions ahora — ver
// vault/portfolio: planes/rediseno-admin-server-actions.
export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<Content>(emptyContent)
  const [isLoading, setIsLoading] = useState(true)
  // Puesto en true por hydrateContent (llamado desde un ContentHydrator hijo,
  // vía useLayoutEffect — corre antes que este useEffect en el mismo commit).
  // Evita repetir los 7 fetches cuando la página ya trajo todo server-side.
  const hydratedRef = useRef(false)

  useEffect(() => {
    if (hydratedRef.current) return
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true)

      try {
        // Antes: 7 awaits en cadena (uno detrás del otro) — son fetches
        // independientes entre sí, no hay razón para esperarlos en serie.
        const [
          contentData,
          webProjects,
          mobileProjects,
          infraBackendProjects,
          experienceData,
          skillsData,
          otherSkillsData,
        ] = await Promise.all([
          fetchContent(),
          fetchProjects('web'),
          fetchProjects('mobile'),
          fetchProjects('infra_backend'),
          fetchExperiences(),
          fetchSkills(),
          fetchOtherSkills(),
        ])

        if (contentData) {
          const mapProject = (p: any) => ({
            id: p._id,
            slug: p.slug,
            title: p.title,
            description: p.description,
            image: p.image,
            images: p.images || [],
            tags: p.tags || [],
            subtype: p.subtype,
            github: p.github || "#",
            demo: p.demo || "#",
            createdAt: p.createdAt,
            testimonial: p.testimonial,
            techStack: p.techStack,
            challenge: p.challenge,
            technicalDecisions: p.technicalDecisions || [],
            securityHardening: p.securityHardening || [],
            deploymentDiagram: p.deploymentDiagram || [],
            translations: p.translations || {}
          });

          const projectsData = {
            web: webProjects.map(mapProject),
            mobile: mobileProjects.map(mapProject),
            infra_backend: infraBackendProjects.map(mapProject)
          }

          setContent({
            hero: contentData.hero ? {
              ...contentData.hero,
              translations: contentData.hero.translations || {}
            } : emptyContent.hero,
            about: contentData.about ? {
              ...contentData.about,
              translations: contentData.about.translations || {}
            } : emptyContent.about,
            services: contentData.services?.map((service: any) => ({
              ...service,
              translations: service.translations || {}
            })) || [],
            projects: projectsData,
            skills: {
              frontend: skillsData?.frontend?.map((skill: any) => ({
                ...skill,
                translations: skill.translations || {}
              })) || [],
              backend: skillsData?.backend?.map((skill: any) => ({
                ...skill,
                translations: skill.translations || {}
              })) || [],
              database: skillsData?.database?.map((skill: any) => ({
                ...skill,
                translations: skill.translations || {}
              })) || [],
              devops: skillsData?.devops?.map((skill: any) => ({
                ...skill,
                translations: skill.translations || {}
              })) || []
            },
            otherSkills: otherSkillsData.data?.map((skill: any) => ({
              ...skill,
              translations: skill.translations || {}
            })) || [],
            contact: contentData.contact ? {
              ...contentData.contact,
              translations: contentData.contact.translations || {}
            } : emptyContent.contact,
            experience: experienceData?.map((exp: any) => ({
              ...exp,
              translations: exp.translations || {}
            })) || []
          });
        }
      } catch (error) {
        console.error("Error cargando datos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Reemplazo completo — usado por páginas que ya traen TODO el contenido
  // resuelto server-side (home). Marca hydratedRef para que el useEffect de
  // arriba no dispare los 7 fetches de nuevo.
  const hydrateContent = (initial: Content) => {
    hydratedRef.current = true
    setContent(initial)
    setIsLoading(false)
  }

  // Merge parcial — usado por páginas que solo necesitan una sección (ej.
  // /contact con `contact.email`). No toca hydratedRef: el fetch completo de
  // fondo sigue corriendo normal, así el resto del sitio no se queda vacío
  // si el usuario navega desde acá a otra página.
  const hydratePartial = (partial: Partial<Content>) => {
    setContent((prev) => ({ ...prev, ...partial }))
  }

  const contextValue: ContentContextType = {
    content,
    isLoading,
    hydrateContent,
    hydratePartial,
  }

  return (
    <ContentContext.Provider value={contextValue}>
      {children}
    </ContentContext.Provider>
  )
}
