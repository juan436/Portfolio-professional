"use client"

import { RefObject } from "react"
import { motion } from "framer-motion"

interface ExperienceTimelineProps {
  timelineRef: RefObject<HTMLDivElement | null>
  activeIndex: number
  timelineYears: string[]
  experienceLength: number
  handleDotClick: (index: number) => void
}

export function ExperienceTimeline({
  timelineRef,
  activeIndex,
  timelineYears,
  experienceLength,
  handleDotClick
}: ExperienceTimelineProps) {
  return (
    <motion.div
      className="relative mb-16"
      ref={timelineRef}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blue-500 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${((activeIndex + 1) / experienceLength) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Marcadores de años */}
      <div className="flex justify-between mt-2">
        {timelineYears.map((year, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
            className={`relative cursor-pointer transition-all duration-300 ${
              index === activeIndex ? "scale-125" : "opacity-70 hover:opacity-100"
            }`}
            onClick={() => handleDotClick(index)}
          >
            <div
              className={`w-5 h-5 rounded-full ${
                index === activeIndex
                  ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.7)]"
                  : "bg-blue-900 hover:bg-blue-700"
              } transition-all duration-300`}
            />
            {index === activeIndex && (
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-300 animate-ping" />
            )}
            <div
              className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm ${
                index === activeIndex ? "text-blue-400 font-medium" : "text-slate-500"
              }`}
            >
              {year}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
