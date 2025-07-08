"use client"

import { useState, useEffect, type ReactNode } from "react"
import ContentContext, { ContentContextType } from "./content-context"
import { Content } from "./types"

import {
  fetchContent, fetchProjects, fetchExperiences, fetchSkills, fetchOtherSkills
} from "@/services/api"
import { updateHero } from "./slices/hero/actions"
import { updateAbout } from "./slices/about/actions"
import { updateServices, deleteService as deleteServiceAction } from "./slices/services/actions"
import {
  updateProjects,
  createProjectItem as createProject,
  updateProjectItem as updateProject,
  deleteProjectItem as deleteProject
} from "./slices/projects/actions"
import {
  updateSkills,
  createSkillItem as createSkill,
  updateSkillItem as updateSkill,
  deleteSkillItem as deleteSkill
} from "./slices/skills/actions"
import {
  updateOtherSkills,
  addOtherSkill,
  editOtherSkill,
  removeOtherSkill
} from "./slices/otherSkills/actions"
import { updateContact } from "./slices/contact/actions"
import {
  updateExperience,
  createExperienceItem as createExperience,
  updateExperienceItem as updateExperienceItem,
  deleteExperienceItem as deleteExperienceItem
} from "./slices/experience/actions"

const emptyContent: Content = {
  hero: { title: "", subtitle: "", description: "", profileImage: "", translations: {} },
  about: { paragraph1: "", paragraph2: "", paragraph3: "", translations: {} },
  services: [],
  projects: { fullstack: [], backend: [] },
  skills: { frontend: [], backend: [], database: [], devops: [] },
  otherSkills: [],
  contact: { email: "", phone: "", location: "", translations: {} },
  experience: []
}

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<Content>(emptyContent)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }
    
    const loadData = async () => {
      setIsLoading(true)

      try {
        const contentData = await fetchContent()
        const fullstackProjects = await fetchProjects('fullstack')
        const backendProjects = await fetchProjects('backend')
        const experienceData = await fetchExperiences()
        const skillsData = await fetchSkills()
        const otherSkillsData = await fetchOtherSkills()

        if (contentData) {
          const projectsData = {
            fullstack: fullstackProjects.map((p: any) => ({
              id: p._id,
              title: p.title,
              description: p.description,
              image: p.image,
              tags: p.tags || [],
              github: p.github || "#",
              demo: p.demo || "#",
              createdAt: p.createdAt,
              translations: p.translations || {}
            })),
            backend: backendProjects.map((p: any) => ({
              id: p._id,
              title: p.title,
              description: p.description,
              image: p.image,
              tags: p.tags || [],
              github: p.github || "#",
              demo: p.demo || "#",
              createdAt: p.createdAt,
              translations: p.translations || {}
            }))
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

  const saveAllContent = (): boolean => {
    try {
      if (typeof window !== "undefined") {
        const event = new CustomEvent("contentUpdated", { detail: content })
        window.dispatchEvent(event)
      }
      return true
    } catch (error) {
      console.error("Error dispatching content update event:", error)
      return false
    }
  }

  const contextValue: ContentContextType = {
    content,
    isLoading,
    updateHero: (hero) => updateHero(hero, setContent, setIsLoading),
    updateAbout: (about) => updateAbout(about, setContent, setIsLoading),
    updateServices: (services) => updateServices(services, setContent, setIsLoading),
    updateProjects: (projects) => updateProjects(projects, setContent, setIsLoading),
    updateSkills: (skills) => updateSkills(skills, setContent, setIsLoading),
    updateOtherSkills: (otherSkills) => updateOtherSkills(otherSkills, setContent, setIsLoading),
    updateContact: (contact) => updateContact(contact, setContent, setIsLoading),
    updateExperience: (experience) => updateExperience(experience, setContent, setIsLoading),
    saveAllContent,

    // Método para eliminar servicios
    deleteService: (id) => deleteServiceAction(id, content, setContent, setIsLoading),

    addOtherSkill: (skill) => addOtherSkill(skill, setContent, setIsLoading),
    editOtherSkill: (id, skill) => editOtherSkill(id, skill, setContent, setIsLoading),
    removeOtherSkill: (id) => removeOtherSkill(id, content, setContent, setIsLoading),
    createProjectItem: (project, category) => createProject(project, category, setContent, setIsLoading),
    updateProjectItem: (id, project, category) => updateProject(id, project, category, content, setContent, setIsLoading),
    deleteProjectItem: (id, category) => deleteProject(id, category, content, setContent, setIsLoading),

    createSkillItem: (skill) => createSkill(skill, setContent, setIsLoading),
    updateSkillItem: (id, skill) => updateSkill(id, skill, setContent, setIsLoading),
    deleteSkillItem: (id) => deleteSkill(id, content, setContent, setIsLoading),

    createExperienceItem: (experience) => createExperience(experience, setContent, setIsLoading),
    updateExperienceItem: (id, experience) => updateExperienceItem(id, experience, setContent, setIsLoading),
    deleteExperienceItem: (id) => deleteExperienceItem(id, setContent, setIsLoading)
  }

  return (
    <ContentContext.Provider value={contextValue}>
      {children}
    </ContentContext.Provider>
  )
}
