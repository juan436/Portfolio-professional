"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/hooks/use-language"
import { useContent } from "@/contexts/content/use-content"
import { useTranslatedContent } from "@/hooks/use-translated-content"
import { useEffect, useState } from "react"
import { AboutProfile } from "./about-profile"
import { AboutServices } from "./about-services"

export default function About() {
  const { t, language } = useLanguage()
  const { content } = useContent()
  const { translatedContent } = useTranslatedContent()
  // Usamos el estado local para manejar el contenido actualizado
  const [localContent, setLocalContent] = useState(content)
  const [translatedTexts, setTranslatedTexts] = useState({
    aboutTitle: "",
    role: "",
    engineer: "",
    university: "",
    downloadCV: "",
    heroTitle: ""
  })

  // Cargar traducciones después de la hidratación
  useEffect(() => {
    setTranslatedTexts({
      aboutTitle: String(t("about.title")),
      role: String(t("about.role")),
      engineer: String(t("about.engineer")),
      university: String(t("about.university")),
      downloadCV: String(t("about.downloadCV")),
      heroTitle: String(t("hero.title"))
    })
  }, [t, language])

  // Actualizar el estado local cuando cambia el contenido global
  useEffect(() => {
    setLocalContent(content)
  }, [content])

  // Escuchar el evento contentUpdated para actualizar el componente
  useEffect(() => {
    const handleContentUpdate = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail) {
        // Actualizar todo el contenido local con los datos del evento
        setLocalContent((prev) => ({
          ...prev,
          ...customEvent.detail,
        }))
      }
    }

    // Añadir el event listener
    window.addEventListener("contentUpdated", handleContentUpdate)

    // Limpiar el event listener cuando el componente se desmonte
    return () => {
      window.removeEventListener("contentUpdated", handleContentUpdate)
    }
  }, [])
  // Función para obtener la ruta del CV según el idioma actual
  const getCvPath = () => {
    switch (language.code) {
      case 'en':
        return '/documents/Juan_Villegas_CV_EN.pdf';
      case 'it':
        return '/documents/Juan_Villegas_CV_EN.pdf';
      case 'fr':
        return '/documents/Juan_Villegas_CV_EN.pdf';
      case 'es':
      default:
        return '/documents/Juan_Villegas_CV_ES.pdf';
    }
  };

  return (
    <section id="about" className="py-20 bg-black/50 relative">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{translatedTexts.aboutTitle}</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="md:col-span-5 flex justify-center items-center"
          >
            <AboutProfile 
              profileImage={content.hero.profileImage} 
              heroTitle={translatedTexts.heroTitle}
              role={translatedTexts.role}
              engineer={translatedTexts.engineer}
              university={translatedTexts.university}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="md:col-span-7 flex flex-col justify-center"
          >
            <div className="space-y-6 text-slate-300">
              {/* Usar translatedAbout para mostrar los párrafos traducidos */}
              <p className="leading-relaxed">{translatedContent.about.paragraph1}</p>
              <p className="leading-relaxed">{translatedContent.about.paragraph2}</p>
              <p className="leading-relaxed">{translatedContent.about.paragraph3}</p>

              <div className="pt-4">
                <a 
                  href={getCvPath()} 
                  download 
                  className="inline-flex items-center text-blue-500 hover:text-blue-400 transition-colors"
                >
                  <span className="mr-2">{translatedTexts.downloadCV}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        <AboutServices services={translatedContent.services} />
      </div>
    </section>
  )
}
