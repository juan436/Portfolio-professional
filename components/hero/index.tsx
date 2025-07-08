"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useLanguage } from "@/hooks/use-language"
import { useTranslatedContent } from "@/hooks/use-translated-content"
import { HeroSocialLinks } from "./hero-social-links"
import { HeroAnimation } from "./hero-animation"

export default function Hero() {
  const { t, language } = useLanguage()
  const { translatedContent } = useTranslatedContent()
  const [showAnimation, setShowAnimation] = useState(false)
  const [translatedTexts, setTranslatedTexts] = useState<{
    projects: string;
    contact: string;
  }>({
    projects: "",
    contact: ""
  })

  useEffect(() => {
    setTranslatedTexts({
      projects: String(t("hero.projects")),
      contact: String(t("hero.contact"))
    })
  }, [t, language])

  const toggleAnimation = () => {
    setShowAnimation(!showAnimation)
  }

  return (
    <section id="home" className="pt-32 pb-20 md:pt-40 md:pb-32 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/90 to-black" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="text-blue-500">{translatedContent.hero.title}</span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-slate-400">
                {translatedContent.hero.subtitle}
              </span>
            </h1>

            <p className="text-slate-400 text-lg mb-8 max-w-lg">{translatedContent.hero.description}</p>

            <div className="flex flex-wrap gap-4">
              <Button asChild className="bg-blue-700 hover:bg-blue-800">
                <Link href="#projects">
                  {translatedTexts.projects} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button asChild variant="outline" className="border-blue-700 text-blue-500 hover:bg-blue-700/10">
                <Link href="#contact">{translatedTexts.contact}</Link>
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
              ` role: '${translatedContent.hero.subtitle}',`,
              " skills: ['React', 'Node']",
              "};",
            ]}
          />
        </div>
      </div>
    </section>
  )
}
