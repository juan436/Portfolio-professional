"use client"

import { motion } from "framer-motion"

interface WelcomeTextProps {
  welcomeText: string
}

export function WelcomeText({ welcomeText }: WelcomeTextProps) {
  return (
    <>
      <motion.h1
        className="text-3xl md:text-4xl font-bold mb-4 text-blue-500"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        Juan Villegas
      </motion.h1>

      <motion.div
        className="max-w-md mx-auto"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <p className="text-lg text-slate-300">{welcomeText}</p>
      </motion.div>

      <motion.div
        className="mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.5 }}
      >
        <div className="w-16 h-16 mx-auto">
          <motion.div
            className="w-full h-full border-t-4 border-blue-500 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: 1, ease: "linear" }}
          />
        </div>
      </motion.div>
    </>
  )
}
