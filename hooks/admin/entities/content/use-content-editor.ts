import { useState, useEffect, useCallback, useRef } from "react";
import { fetchContent } from "@/services/api/content";
import { updateHeroAction, updateAboutAction, updateServicesAction, updateContactAction } from "@/lib/actions/content";
import { useToastNotifications } from "../../use-toast-notifications";
import { HeroContent } from "@/components/admin/forms/hero-form";
import { AboutContent } from "@/components/admin/forms/about-form";
import { Service } from "@/components/admin/forms/services-form";
import { ContactContent } from "@/components/admin/forms/contact-form";

const DEFAULT_PROFILE_IMAGE =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/profile-E9YRocD6o4olhnzraHWCjLmKjCbspw.jpeg";

/**
 * Hook del editor de contenido (Hero/About/Services/Contact) — reescrito
 * para usar Server Actions (lib/actions/content.ts), Fase 4 (auditoría
 * 2026-08-19). Carga inicial propia (ya no depende de ContentProvider).
 */
export function useContentEditor() {
  const { showSuccessToast, showErrorToast } = useToastNotifications();
  const [activeTab, setActiveTab] = useState("hero");
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const initialContent = useRef({
    hero: {} as HeroContent,
    about: {} as AboutContent,
    services: [] as Service[],
    contact: {} as ContactContent
  });

  const [heroContent, setHeroContent] = useState<HeroContent>({} as HeroContent);
  const [aboutContent, setAboutContent] = useState<AboutContent>({ paragraph1: "", paragraph2: "", paragraph3: "" });
  const [servicesContent, setServicesContent] = useState<Service[]>([]);
  const [contactContent, setContactContent] = useState<ContactContent>({} as ContactContent);

  const applyLoadedContent = useCallback((content: any) => {
    const heroData: HeroContent = {
      ...content?.hero,
      profileImage: content?.hero?.profileImage || DEFAULT_PROFILE_IMAGE,
    };
    const aboutData: AboutContent = {
      paragraph1: content?.about?.paragraph1 || "",
      paragraph2: content?.about?.paragraph2 || "",
      paragraph3: content?.about?.paragraph3 || "",
    };
    const servicesData: Service[] = content?.services || [];
    const contactData: ContactContent = content?.contact || {};

    setHeroContent(heroData);
    setAboutContent(aboutData);
    setServicesContent(servicesData);
    setContactContent(contactData);

    initialContent.current = {
      hero: JSON.parse(JSON.stringify(heroData)),
      about: JSON.parse(JSON.stringify(aboutData)),
      services: JSON.parse(JSON.stringify(servicesData)),
      contact: JSON.parse(JSON.stringify(contactData)),
    };
    setHasChanges(false);
  }, []);

  const load = useCallback(async () => {
    setIsFetching(true);
    try {
      const content = await fetchContent();
      applyLoadedContent(content);
    } finally {
      setIsFetching(false);
    }
  }, [applyLoadedContent]);

  useEffect(() => {
    load();
  }, [load]);

  // Detectar cambios en el contenido
  useEffect(() => {
    const currentContent = { hero: heroContent, about: aboutContent, services: servicesContent, contact: contactContent };
    setHasChanges(JSON.stringify(currentContent) !== JSON.stringify(initialContent.current));
  }, [heroContent, aboutContent, servicesContent, contactContent]);

  const handleSave = useCallback(async () => {
    if (!hasChanges) return;

    try {
      setIsLoading(true);

      await Promise.all([
        JSON.stringify(heroContent) !== JSON.stringify(initialContent.current.hero) ? updateHeroAction(heroContent) : Promise.resolve(),
        JSON.stringify(aboutContent) !== JSON.stringify(initialContent.current.about) ? updateAboutAction(aboutContent) : Promise.resolve(),
        JSON.stringify(servicesContent) !== JSON.stringify(initialContent.current.services) ? updateServicesAction(servicesContent) : Promise.resolve(),
        JSON.stringify(contactContent) !== JSON.stringify(initialContent.current.contact) ? updateContactAction(contactContent) : Promise.resolve(),
      ]);

      await load();
      showSuccessToast("Cambios guardados", "El contenido ha sido actualizado correctamente.");
    } catch (error) {
      console.error("Error al guardar el contenido:", error);
      showErrorToast("Error", "Ocurrió un error inesperado al guardar los cambios.");
    } finally {
      setIsLoading(false);
    }
  }, [heroContent, aboutContent, servicesContent, contactContent, hasChanges, load, showSuccessToast, showErrorToast]);

  return {
    activeTab,
    isFetching,
    isLoading,
    heroContent,
    aboutContent,
    servicesContent,
    contactContent,
    hasChanges,

    setActiveTab,
    setHeroContent,
    setAboutContent,
    setServicesContent,
    setContactContent,

    handleSave
  };
}
