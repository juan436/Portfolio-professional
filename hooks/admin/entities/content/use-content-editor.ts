import { useState, useEffect, useCallback, useRef } from "react";
import { useContent } from "@/contexts/content";
import { useToastNotifications } from "../../use-toast-notifications";
import { HeroContent } from "@/components/admin/forms/hero-form";
import { AboutContent } from "@/components/admin/forms/about-form";
import { Service } from "@/components/admin/forms/services-form";
import { ContactContent } from "@/components/admin/forms/contact-form";

/**
 * Hook personalizado para gestionar el estado y la lógica del editor de contenido
 * Encapsula toda la lógica de gestión de contenido para las secciones Hero, About, Services y Contact
 */
export function useContentEditor() {
  const { 
    content, 
    updateHero, 
    updateAbout, 
    updateServices, 
    updateContact, 
    saveAllContent 
  } = useContent();
  
  const { showSuccessToast, showErrorToast } = useToastNotifications();
  const [activeTab, setActiveTab] = useState("hero");
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Referencias para almacenar el estado inicial
  const initialContent = useRef({
    hero: {} as HeroContent,
    about: {} as AboutContent,
    services: [] as Service[],
    contact: {} as ContactContent
  });

  // Estados locales para edición
  const [heroContent, setHeroContent] = useState<HeroContent>({
    ...content.hero,
    profileImage:
      content.hero.profileImage ||
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/profile-E9YRocD6o4olhnzraHWCjLmKjCbspw.jpeg",
  });
  
  const [aboutContent, setAboutContent] = useState<AboutContent>({
    paragraph1: content.about.paragraph1 || "",
    paragraph2: content.about.paragraph2 || "",
    paragraph3: content.about.paragraph3 || "",
  });
  
  const [servicesContent, setServicesContent] = useState<Service[]>(content.services || []);
  const [contactContent, setContactContent] = useState<ContactContent>(content.contact);

  // Actualizar estados locales cuando cambia el contenido global
  useEffect(() => {
    // Evitar actualizaciones innecesarias que causan parpadeo
    if (isLoading) return;

    const heroData = {
      ...content.hero,
      profileImage:
        content.hero.profileImage ||
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/profile-E9YRocD6o4olhnzraHWCjLmKjCbspw.jpeg",
    };

    const aboutData = {
      paragraph1: content.about.paragraph1 || "",
      paragraph2: content.about.paragraph2 || "",
      paragraph3: content.about.paragraph3 || "",
    };

    const servicesData = content.services || [];
    const contactData = content.contact;

    setHeroContent(heroData);
    setAboutContent(aboutData);
    setServicesContent(servicesData);
    setContactContent(contactData);

    // Guardar una copia profunda del estado inicial
    initialContent.current = {
      hero: JSON.parse(JSON.stringify(heroData)),
      about: JSON.parse(JSON.stringify(aboutData)),
      services: JSON.parse(JSON.stringify(servicesData)),
      contact: JSON.parse(JSON.stringify(contactData))
    };

    // Resetear el estado de cambios
    setHasChanges(false);
  }, [content, isLoading]);

  // Detectar cambios en el contenido
  useEffect(() => {
    // Comparar el estado actual con el estado inicial
    const currentContent = {
      hero: heroContent,
      about: aboutContent,
      services: servicesContent,
      contact: contactContent
    };

    const currentJson = JSON.stringify(currentContent);
    const initialJson = JSON.stringify(initialContent.current);
    
    setHasChanges(currentJson !== initialJson);
  }, [heroContent, aboutContent, servicesContent, contactContent]);

  /**
   * Función para guardar todos los cambios en el contenido
   */
  const handleSave = useCallback(async () => {
    // Si no hay cambios, no hacer nada
    if (!hasChanges) return;

    try {
      setIsLoading(true);

      // Primero actualizar el contexto global con los estados locales
      updateHero(heroContent);
      updateAbout(aboutContent);
      updateServices(servicesContent);
      updateContact(contactContent);

      // Luego guardar todo en localStorage y disparar el evento
      const success = saveAllContent();

      if (success) {
        showSuccessToast(
          "Cambios guardados",
          "El contenido ha sido actualizado correctamente."
        );
      } else {
        showErrorToast(
          "Error al guardar",
          "Ha ocurrido un error al guardar los cambios."
        );
      }
    } catch (error) {
      console.error("Error al guardar el contenido:", error);
      showErrorToast(
        "Error",
        "Ocurrió un error inesperado al guardar los cambios."
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    heroContent, 
    aboutContent, 
    servicesContent, 
    contactContent, 
    updateHero, 
    updateAbout, 
    updateServices, 
    updateContact, 
    saveAllContent, 
    showSuccessToast, 
    showErrorToast,
    hasChanges
  ]);

  return {
    // Estados
    activeTab,
    isLoading,
    heroContent,
    aboutContent,
    servicesContent,
    contactContent,
    hasChanges,
    
    // Setters
    setActiveTab,
    setHeroContent,
    setAboutContent,
    setServicesContent,
    setContactContent,
    
    // Acciones
    handleSave
  };
}
