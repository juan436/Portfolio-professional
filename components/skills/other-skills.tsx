"use client"

import { motion } from "framer-motion"
import { useLanguage } from "@/hooks/use-language"
import type { OtherSkill } from "@/contexts/content/types"

interface OtherSkillsProps {
  otherSkills: OtherSkill[]
  translatedTexts: {
    other: string
    [key: string]: string
  }
}

export function OtherSkills({ otherSkills, translatedTexts }: OtherSkillsProps) {
  const { language } = useLanguage();
  
  // Función para obtener el nombre traducido de la habilidad
  const getTranslatedName = (skill: OtherSkill) => {
    // Si es español o no hay traducciones disponibles, devolver el nombre original
    if (language.code === 'es' || !skill.translations || !skill.translations[language.code]) {
      return skill.name;
    }
    // Devolver la traducción o el nombre original si no hay traducción
    return skill.translations[language.code]?.name || skill.name;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      viewport={{ once: true }}
      className="mt-16"
    >
      <h3 className="text-xl font-semibold mb-6 text-center">{translatedTexts.other}</h3>
      <div className="flex flex-wrap justify-center gap-2">
        {otherSkills.map((skill, index) => (
          <motion.span
            key={skill._id || `other-skill-${index}`}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            viewport={{ once: true }}
            className="px-3 py-1 bg-blue-700/20 text-blue-400 rounded-full text-sm border border-blue-700/30 hover:bg-blue-700/30 transition-colors"
          >
            {getTranslatedName(skill)}
          </motion.span>
        ))}
      </div>
    </motion.div>
  )
}
