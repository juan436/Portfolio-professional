import { useLanguage } from './use-language';
import { useContent } from '@/contexts/content/use-content';
import { Content, Experience, OtherSkill, Project } from '@/contexts/content/types';
import { LanguageCode } from '@/contexts/language-context';

/**
 * Hook personalizado que combina useLanguage y useContent para obtener
 * el contenido traducido según el idioma seleccionado
 */
export const useTranslatedContent = () => {
  const { language } = useLanguage();
  const { content } = useContent();
  
  // Función para obtener el texto traducido o el texto original si no hay traducción
  const getTranslatedText = (
    originalText: string | undefined,
    translations: Record<string, any> | undefined,
    field: string,
    langCode: LanguageCode
  ): string => {
    if (!translations || !translations[langCode] || !translations[langCode][field]) {
      return originalText || '';
    }
    return translations[langCode][field];
  };

  // Traducir el contenido del hero
  const translatedHero = {
    ...content.hero,
    title: language.code !== 'es' 
      ? getTranslatedText(content.hero.title, content.hero.translations, 'title', language.code) 
      : content.hero.title,
    subtitle: language.code !== 'es' 
      ? getTranslatedText(content.hero.subtitle, content.hero.translations, 'subtitle', language.code) 
      : content.hero.subtitle,
    description: language.code !== 'es' 
      ? getTranslatedText(content.hero.description, content.hero.translations, 'description', language.code) 
      : content.hero.description,
  };

  // Traducir el contenido del about
  const translatedAbout = {
    ...content.about,
    paragraph1: language.code !== 'es' 
      ? getTranslatedText(content.about.paragraph1, content.about.translations, 'paragraph1', language.code) 
      : content.about.paragraph1,
    paragraph2: language.code !== 'es' 
      ? getTranslatedText(content.about.paragraph2, content.about.translations, 'paragraph2', language.code) 
      : content.about.paragraph2,
    paragraph3: language.code !== 'es' 
      ? getTranslatedText(content.about.paragraph3, content.about.translations, 'paragraph3', language.code) 
      : content.about.paragraph3,
  };

  // Traducir el contenido de contacto
  const translatedContact = {
    ...content.contact,
    location: language.code !== 'es' 
      ? getTranslatedText(content.contact.location, content.contact.translations, 'location', language.code) 
      : content.contact.location,
  };

  // Función para traducir experiencias
  const translateExperience = (exp: Experience): Experience => {
    if (language.code === 'es' || !exp.translations || !exp.translations[language.code]) {
      return exp;
    }
    
    const translations = exp.translations[language.code];
    
    return {
      ...exp,
      position: translations?.position ?? exp.position,
      description: translations?.description ?? exp.description,
      location: translations?.location ?? exp.location,
    };
  };

  // Traducir experiencias
  const translatedExperience = content.experience.map(translateExperience);

  // Función para traducir proyectos
  const translateProject = (proj: Project): Project => {
    if (language.code === 'es' || !proj.translations || !proj.translations[language.code]) {
      return proj;
    }
    
    const translations = proj.translations[language.code];
    
    return {
      ...proj,
      title: translations?.title ?? proj.title,
      description: translations?.description ?? proj.description,
    };
  };

  // Traducir proyectos
  const translatedProjects = {
    fullstack: content.projects.fullstack.map(translateProject),
    backend: content.projects.backend.map(translateProject),
  };

  // Función para traducir otras habilidades
  const translateOtherSkill = (skill: OtherSkill): OtherSkill => {
    if (language.code === 'es' || !skill.translations || !skill.translations[language.code]) {
      return skill;
    }
    
    const translations = skill.translations[language.code];
    
    return {
      ...skill,
      name: translations?.name ?? skill.name,
    };
  };

  // Traducir otras habilidades
  const translatedOtherSkills = content.otherSkills.map(translateOtherSkill);

  // Traducir servicios
  const translatedServices = content.services.map(service => {
    if (language.code === 'es' || !service.translations || !service.translations[language.code]) {
      return service;
    }
    
    const translations = service.translations[language.code];
    
    return {
      ...service,
      title: translations?.title ?? service.title,
      description: translations?.description ?? service.description,
    };
  });

  // Crear el contenido traducido completo
  const translatedContent: Content = {
    ...content,
    hero: translatedHero,
    about: translatedAbout,
    contact: translatedContact,
    experience: translatedExperience,
    projects: translatedProjects,
    otherSkills: translatedOtherSkills,
    services: translatedServices,
  };

  return {
    translatedContent,
    currentLanguage: language,
  };
};
