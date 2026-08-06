"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"
import { useLanguage } from "@/hooks/use-language"
import { useTranslatedContent } from "@/hooks/use-translated-content"
import { HeroSocialLinks } from "./hero-social-links"
import { HeroAnimation } from "./hero-animation"

export default function Hero() {
  const { t, language } = useLanguage()
  const { translatedContent } = useTranslatedContent()
  const [showAnimation, setShowAnimation] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [translatedTexts, setTranslatedTexts] = useState<{
    projects: string;
    contact: string;
    primary: string;
    secondary: string;
  }>({
    projects: "",
    contact: "",
    primary: "",
    secondary: ""
  })

  useEffect(() => {
    setIsMounted(true)
    setTranslatedTexts({
      projects: String(t("hero.projects")),
      contact: String(t("hero.contact")),
      primary: String(t("ctas.hero.primary")),
      secondary: String(t("ctas.hero.secondary"))
    })
  }, [t, language])

  const toggleAnimation = () => {
    setShowAnimation(!showAnimation)
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="pt-32 pb-20 md:pt-40 md:pb-32 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/90 to-black" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-6"
            >
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              {isMounted ? t("hero.consultantBadge") : ""}
            </motion.div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-4 leading-tight">
              <span className="text-blue-500 block">
                {translatedContent.hero.title}
              </span>
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-400 mb-8 tracking-wide">
              {translatedContent.hero.subtitle}
            </h2>

            <p className="text-slate-400/80 text-lg mb-8 max-w-lg leading-relaxed lowercase first-letter:uppercase">
              {translatedContent.hero.description}
            </p>

            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => scrollToSection('contact')}
                className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase italic tracking-wider shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all duration-300 border-none px-8 py-6"
              >
                {translatedTexts.primary} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button 
                variant="outline" 
                onClick={() => scrollToSection('testimonials')}
                className="border-blue-600/50 text-blue-400 hover:bg-blue-600/10 font-bold px-8 py-6"
              >
                {translatedTexts.secondary}
              </Button>
            </div>

            <HeroSocialLinks />
          </motion.div>

          <HeroAnimation 
            showAnimation={showAnimation} 
            toggleAnimation={toggleAnimation} 
            codeLines={[
              "const dev = {",
              ` name: '${translatedContent.hero.title}',`,
              ` role: '${translatedContent.hero.subtitle.split('|')[0]}',`,
              " skills: ['React', 'Node']",
              "};",
            ]}
          />
        </div>
      </div>
    </section>
  )
}
