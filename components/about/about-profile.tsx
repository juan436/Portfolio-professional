"use client"

import { motion } from "framer-motion"
import Image from "next/image"

interface AboutProfileProps {
  profileImage: string
  heroTitle: string
  role: string
  engineer: string
  university: string
}

export function AboutProfile({ profileImage, heroTitle, role, engineer, university }: AboutProfileProps) {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-700/20 to-transparent rounded-lg transform rotate-3"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-blue-700/20 to-transparent rounded-lg transform -rotate-3"></div>
      <motion.div
        className="relative bg-black/40 border border-blue-700/30 rounded-lg p-6"
        whileHover={{
          scale: 1.02,
          boxShadow: "0 0 20px rgba(59, 130, 246, 0.3)",
          borderColor: "rgba(59, 130, 246, 0.6)",
          transition: { duration: 0.3 },
        }}
      >
        <motion.div
          className="aspect-[4/5] relative overflow-hidden rounded-lg mb-6"
          whileHover={{
            filter: "brightness(1.1)",
          }}
        >
          <motion.div
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.4 },
            }}
          >
            <Image
              src={
                profileImage ||
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/profile-E9YRocD6o4olhnzraHWCjLmKjCbspw.jpeg" ||
                "/placeholder.svg"
              }
              alt="Juan Villegas"
              width={400}
              height={500}
              className="object-cover object-top transition-all duration-300"
            />
          </motion.div>
        </motion.div>
        <div className="space-y-2 text-center">
          <h3 className="text-xl font-bold">{heroTitle}</h3>
          <p className="text-blue-500">{role}</p>
          <p className="text-sm text-slate-400">
            {engineer}
            <br />
            {university}
          </p>
        </div>
      </motion.div>
    </div>
  )
}
