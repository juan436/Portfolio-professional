"use client"

import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { User, FileText, Code, Cpu, Save } from "lucide-react"
import Script from "next/script"

// Importar componentes extraídos
import HeroForm from "@/components/admin/forms/hero-form"
import AboutForm from "@/components/admin/forms/about-form"
import ServicesForm from "@/components/admin/forms/services-form"
import ContactForm from "@/components/admin/forms/contact-form"

// Importar hook personalizado
import { useContentEditor } from "@/hooks/admin/entities/content/use-content-editor"

export default function ContentEditor() {
  const {
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
  } = useContentEditor();

  return (
    <>
      {/* Script para cargar los iconos de Devicon (necesario para las habilidades) */}
      <Script src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.js" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Editor de Contenido</h2>
          <Button
            onClick={handleSave}
            className="bg-blue-700 hover:bg-blue-800"
            disabled={isLoading || !hasChanges}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar
              </>
            )}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-black/40 border border-blue-700/20 mb-6">
            <TabsTrigger value="hero" className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500">
              <User className="mr-2 h-4 w-4" />
              Hero
            </TabsTrigger>
            <TabsTrigger value="about" className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500">
              <FileText className="mr-2 h-4 w-4" />
              Sobre Mí
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500"
            >
              <Code className="mr-2 h-4 w-4" />
              Servicios
            </TabsTrigger>
            <TabsTrigger value="contact" className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500">
              <Cpu className="mr-2 h-4 w-4" />
              Contacto
            </TabsTrigger>
          </TabsList>

          {/* Contenido de las tabs usando los componentes refactorizados */}
          <TabsContent value="hero" className="mt-0">
            <HeroForm content={heroContent} onChange={setHeroContent} />
          </TabsContent>

          <TabsContent value="about" className="mt-0">
            <AboutForm content={aboutContent} onChange={setAboutContent} />
          </TabsContent>

          <TabsContent value="services" className="mt-0">
            <ServicesForm services={servicesContent} onChange={setServicesContent} />
          </TabsContent>

          <TabsContent value="contact" className="mt-0">
            <ContactForm content={contactContent} onChange={setContactContent} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </>
  )
}
