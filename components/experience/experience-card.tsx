"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Building2, Calendar, ChevronDown, ChevronUp } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { Experience } from "@/contexts/content/types"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"

interface ExperienceCardProps {
  sortedExperience: Experience[]
  activeIndex: number
  handleMouseDown?: (e: React.MouseEvent | TouchEvent) => void
  handleMouseMove?: (e: React.MouseEvent | TouchEvent) => void
  handleMouseUp?: () => void
}

// Número máximo de caracteres para mostrar en la descripción resumida
const MAX_DESCRIPTION_LENGTH = 350;

// Altura base de la tarjeta (altura cuando está contraída)
const BASE_CARD_HEIGHT = {
  default: 480, 
  md: 420      
};

export function ExperienceCard({
  sortedExperience,
  activeIndex,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
}: ExperienceCardProps) {
  const { language } = useLanguage()
  const { t } = useTranslation()
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({})
  const contentRef = useRef<HTMLDivElement>(null)
  const techContainerRef = useRef<HTMLDivElement>(null)

  // Función para obtener el texto traducido o el original si no hay traducción
  const getTranslatedField = (experience: Experience, field: "position" | "description" | "location") => {
    if (language.code === "es" || !experience.translations || !experience.translations[language.code]) {
      return experience[field] ?? ""
    }
    return experience.translations[language.code]?.[field] ?? experience[field] ?? ""
  }

  // Función para alternar la expansión de la descripción
  const toggleDescription = (experienceId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setExpandedDescriptions((prev) => ({
      ...prev,
      [experienceId]: !prev[experienceId],
    }))
  }

  // Función para verificar si la descripción debe truncarse
  const shouldTruncate = (description: string) => {
    return description.length > MAX_DESCRIPTION_LENGTH
  }

  // Función para obtener la descripción formateada (completa o truncada)
  const getFormattedDescription = (experience: Experience) => {
    const description = getTranslatedField(experience, "description")
    const experienceId = experience._id || ""
    const isExpanded = expandedDescriptions[experienceId]

    if (!shouldTruncate(description) || isExpanded) {
      return description
    }

    return `${description.substring(0, MAX_DESCRIPTION_LENGTH)}...`
  }

  return (
    <div
      className="overflow-hidden perspective-3d"
      onMouseDown={(e) => {
        // Solo activar el arrastre cuando se hace clic directamente en el contenedor
        if (e.target === e.currentTarget && handleMouseDown) {
          handleMouseDown(e)
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="relative">
        <AnimatePresence mode="wait">
          {sortedExperience.map(
            (experience, index) =>
              index === activeIndex && (
                <motion.div
                  key={index}
                  className="w-full"
                  initial={{
                    opacity: 0,
                    filter: "blur(10px)",
                    scale: 0.9,
                  }}
                  animate={{
                    opacity: 1,
                    filter: "blur(0px)",
                    scale: 1,
                    transition: {
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  }}
                  exit={{
                    opacity: 0,
                    filter: "blur(10px)",
                    scale: 1.1,
                    transition: {
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  }}
                >
                  <div
                    ref={contentRef}
                    className="bg-gray-900/60 rounded-lg border border-blue-900/30 shadow-xl backdrop-blur-md overflow-hidden"
                  >
                    {/* Header Section */}
                    <div className="p-6 sm:p-8 pb-0">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 break-words">
                            {getTranslatedField(experience, "position")}
                          </h3>
                          <div className="flex items-center text-blue-300">
                            <Building2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-500 flex-shrink-0" />
                            <span className="font-medium text-sm sm:text-base break-words">{experience.company}</span>
                          </div>
                        </div>

                        <div className="flex items-center text-blue-300 bg-blue-900/30 px-3 sm:px-4 py-2 rounded-full flex-shrink-0">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-blue-500" />
                          <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{experience.period}</span>
                        </div>
                      </div>
                    </div>

                    {/* Description Section */}
                    <div className="px-6 sm:px-8">
                      <motion.div
                        className="mb-6"
                        layout
                        transition={{
                          duration: 0.3,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        <motion.p
                          className="text-slate-300 text-base sm:text-lg leading-relaxed"
                          layout
                          transition={{
                            duration: 0.3,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        >
                          {getFormattedDescription(experience)}
                        </motion.p>

                        {shouldTruncate(getTranslatedField(experience, "description")) && (
                          <motion.div
                            layout
                            transition={{
                              duration: 0.3,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-3 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 p-0 h-auto flex items-center transition-colors duration-200"
                              onClick={(e) => toggleDescription(experience._id || "", e)}
                            >
                              {expandedDescriptions[experience._id || ""] ? (
                                <>
                                  <span className="text-sm mr-1">{t('common.seeLess') || "Ver menos"}</span>
                                  <ChevronUp className="h-4 w-4" />
                                </>
                              ) : (
                                <>
                                  <span className="text-sm mr-1">{t('common.seeMore') || "Ver más"}</span>
                                  <ChevronDown className="h-4 w-4" />
                                </>
                              )}
                            </Button>
                          </motion.div>
                        )}
                      </motion.div>

                      {/* Divider */}
                      <div className="border-t border-blue-900/30 mb-6"></div>
                    </div>

                    {/* Technologies Section */}
                    <div 
                      ref={techContainerRef}
                      className="px-6 sm:px-8 pb-6 sm:pb-8"
                    >
                      <h4 className="text-xs sm:text-sm uppercase tracking-wider text-slate-400 mb-4 font-medium">
                        {String(t("experience.technologies") || "Technologies")}
                      </h4>
                      <motion.div
                        className="flex flex-wrap gap-2"
                        initial="hidden"
                        animate="visible"
                        variants={{
                          hidden: { opacity: 0 },
                          visible: {
                            opacity: 1,
                            transition: {
                              staggerChildren: 0.05,
                              delayChildren: 0.2,
                            },
                          },
                        }}
                      >
                        {experience.skills?.map(
                          (skill, idx) => (
                            <motion.div
                              key={idx}
                              variants={{
                                hidden: { opacity: 0, y: 10 },
                                visible: {
                                  opacity: 1,
                                  y: 0,
                                  transition: {
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30,
                                  },
                                },
                              }}
                            >
                              <Badge className="bg-blue-950 text-blue-300 border border-blue-900/50 hover:bg-blue-900 hover:border-blue-800 transition-all duration-200 py-1.5 px-3 sm:px-4 text-xs sm:text-sm hover:scale-105 transform cursor-default">
                                {skill}
                              </Badge>
                            </motion.div>
                          ),
                        )}
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ),
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
