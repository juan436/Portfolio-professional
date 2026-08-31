/**
 * Definiciones de tipos compartidos para el contexto de contenido.
 * Recibe: nada (solo tipos).
 * Produce: `Content` y sus subtipos (Hero/About/Service/Project/Skill/Contact/Experience/OtherSkill),
 * usados por `ContentProvider`/`useContent` y por los componentes de lectura del sitio público.
 */

export type TranslationLanguages = 'en' | 'fr' | 'it';

export type Hero = {
  title: string
  subtitle: string
  description: string
  profileImage: string
  aboutImage?: string
  translations?: {
    [key in TranslationLanguages]?: {
      title?: string
      subtitle?: string
      description?: string
    }
  }
}

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

export type Project = {
  id: number
  slug?: string
  title: string
  description: string
  image?: string
  images?: string[]
  github: string
  demo: string
  tags?: string[]
  subtype?: string
  createdAt?: string
  testimonial?: {
    author: string
    role: string
    content: string
  }
  techStack?: {
    frontend?: string[]
    backend?: string[]
    database?: string[]
    infra?: string[]
  }
  challenge?: {
    problem: string
    solution: string
  }
  technicalDecisions?: {
    title: string
    description: string
  }[]
  securityHardening?: string[]
  deploymentDiagram?: {
    icon: string
    label: string
  }[]
  _modifiedFields?: string[]
  translations?: {
    [key in TranslationLanguages]?: {
      title?: string
      description?: string
    }
  }
}

export type Projects = {
  web: Project[]
  mobile: Project[]
  infra_backend: Project[]
}

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

export type OtherSkill = {
  _id?: string;
  name: string;
  translations?: {
    [key in TranslationLanguages]?: {
      name?: string
    }
  }
};

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
