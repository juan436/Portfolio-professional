"use client"

import { createContext, useContext } from "react"
import { 
  Hero, About, Service, Project, Projects, 
  Skill, Skills, Contact, OtherSkill, Experience, Content 
} from "./types"

// Definir el tipo para el contexto de contenido
export type ContentContextType = {
  // Estado global
  content: Content
  isLoading: boolean
  
  // Métodos para actualizar secciones principales
  updateHero: (hero: Hero) => void
  updateAbout: (about: About) => void
  updateServices: (services: Service[]) => void
  updateProjects: (projects: Projects) => void
  updateSkills: (skills: Skills) => void
  updateOtherSkills: (otherSkills: OtherSkill[]) => void
  updateContact: (contact: Contact) => void
  updateExperience: (experience: Experience[]) => void
  saveAllContent: () => boolean
  
  // Método para eliminar servicios
  deleteService: (id: string) => Promise<boolean>
  
  // Métodos para OtherSkills
  addOtherSkill: (skill: OtherSkill) => Promise<OtherSkill | null>
  editOtherSkill: (id: string, updatedSkill: OtherSkill) => Promise<boolean>
  removeOtherSkill: (id: string) => Promise<boolean>
  
  // Métodos para proyectos
  createProjectItem: (project: Omit<Project, "id">, category: 'fullstack' | 'backend') => Promise<Project | null>
  updateProjectItem: (id: string, project: Project, category: 'fullstack' | 'backend') => Promise<boolean>
  deleteProjectItem: (id: string, category: 'fullstack' | 'backend') => Promise<boolean>
  
  // Métodos para skills
  createSkillItem: (skillData: Omit<Skill, "_id">) => Promise<Skill | null>
  updateSkillItem: (id: string, skill: Skill) => Promise<boolean>
  deleteSkillItem: (id: string) => Promise<boolean>
  
  // Métodos para experiencia
  createExperienceItem: (experience: Omit<Experience, "_id">) => Promise<Experience | null>
  updateExperienceItem: (id: string, experience: Experience) => Promise<boolean>
  deleteExperienceItem: (id: string) => Promise<boolean>
}

// Crear el contexto
const ContentContext = createContext<ContentContextType | undefined>(undefined)

export default ContentContext
