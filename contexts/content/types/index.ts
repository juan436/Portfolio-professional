// Definiciones de tipos compartidos para el contexto de contenido

// Tipo para traducciones
export type TranslationLanguages = 'en' | 'fr' | 'it';

// Hero
export type Hero = {
  title: string
  subtitle: string
  description: string
  profileImage: string
  translations?: {
    [key in TranslationLanguages]?: {
      title?: string
      subtitle?: string
      description?: string
    }
  }
}

// About
export type About = {
  paragraph1: string
  paragraph2: string
  paragraph3: string
  translations?: {
    [key in TranslationLanguages]?: {
      paragraph1?: string
      paragraph2?: string
      paragraph3?: string
    }
  }
}

// Service
export type Service = {
  _id?: string
  title: string
  description: string
  icon: string
  _modifiedFields?: string[]
  translations?: {
    [key in TranslationLanguages]?: {
      title?: string
      description?: string
    }
  }
}

// Project
export type Project = {
  id: number
  title: string
  description: string
  image?: string
  github: string
  demo: string
  tags?: string[]
  createdAt?: string
  _modifiedFields?: string[]
  translations?: {
    [key in TranslationLanguages]?: {
      title?: string
      description?: string
    }
  }
}

export type Projects = {
  fullstack: Project[]
  backend: Project[]
}

// Skill
export type Skill = {
  _id?: string
  name: string
  icon: string
  category: string
  colored: boolean
  translations?: {
    [key in TranslationLanguages]?: {
      name?: string
    }
  }
}

export type Skills = {
  frontend: Skill[]
  backend: Skill[]
  database: Skill[]
  devops: Skill[]
}

// Contact
export type Contact = {
  email: string
  phone: string
  location: string
  translations?: {
    [key in TranslationLanguages]?: {
      location?: string
    }
  }
}

// OtherSkill
export type OtherSkill = {
  _id?: string;
  name: string;
  translations?: {
    [key in TranslationLanguages]?: {
      name?: string
    }
  }
};

// Experience
export type Experience = {
  _id?: string;
  position: string
  company: string
  period: string
  description: string
  skills?: string[]
  companyLogo?: string
  location?: string
  url?: string
  _modifiedFields?: string[]
  translations?: {
    [key in TranslationLanguages]?: {
      position?: string
      description?: string
      location?: string
    }
  }
}

// Contenido general
export type Content = {
  hero: Hero
  about: About
  services: Service[]
  projects: Projects
  skills: Skills
  otherSkills: OtherSkill[]
  contact: Contact
  experience: Experience[]
}
