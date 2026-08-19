"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAttachments } from "@/hooks/use-attachments"
import { useTranslatedTexts } from "@/hooks/use-translated-texts"
import { JevyChat } from "./jevy-chat"
import { JevyAboutPanel, JevyGuidePanel, AttachmentsCard } from "./side-panels"

const VALID_SERVICES = ["web", "mobile", "automation", "infra", "other"] as const
type ServiceKey = (typeof VALID_SERVICES)[number]

export default function Contact() {
  // No usamos query string (?servicio=...) a propósito: la URL de /contact
  // debe quedar limpia al venir desde una card de Servicio. El dato viaja
  // por sessionStorage, seteado por el onClick de la card. Se lee de forma
  // síncrona (lazy initializer, no useEffect) para que esté disponible desde
  // el primer render en cliente — si no, JevyChat ya habría pintado el saludo
  // genérico antes de que initialService llegara, y el saludo contextual
  // nunca lo reemplaza (solo se pinta una vez, cuando lines.length === 0).
  const [initialService] = useState<ServiceKey | undefined>(() => {
    if (typeof window === "undefined") return undefined
    try {
      const stored = sessionStorage.getItem("jevy_initial_service")
      return stored && (VALID_SERVICES as readonly string[]).includes(stored) ? (stored as ServiceKey) : undefined
    } catch {
      return undefined
    }
  })
  useEffect(() => {
    try {
      sessionStorage.removeItem("jevy_initial_service")
    } catch {}
  }, [])
  const translatedTexts = useTranslatedTexts(
    (t) => ({
      title: String(t("contact.title")),
      attachTooLarge: String(t("contact.jevy.attachTooLarge")),
      attachError: String(t("contact.jevy.attachError")),
    }),
    { title: "", attachTooLarge: "", attachError: "" }
  )

  // Estado de adjuntos compartido entre el chat y la card de la columna izquierda
  const attachments = useAttachments(translatedTexts.attachTooLarge, translatedTexts.attachError)

  return (
    <section id="contact" className="pt-28 pb-20 relative">
      <div className="absolute inset-0 z-0">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-4"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-balance text-blue-500 mb-4">
            {translatedTexts.title}
          </h1>
          <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
        </motion.div>
      </div>

      {/* Fuera del `container` sitewide (max 1024-1400px según breakpoint) a propósito:
          las 3 columnas (240+1000+240+gaps) necesitan más ancho del que ese contenedor da. */}
      <div className="w-full max-w-[1600px] mx-auto px-4 lg:px-8 mt-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,240px)_minmax(0,1000px)_minmax(0,240px)] gap-6 items-start justify-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1 min-w-0 flex flex-col gap-4"
          >
            <JevyAboutPanel />
            <AttachmentsCard attachments={attachments} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2 min-w-0"
          >
            <JevyChat initialService={initialService} attachments={attachments} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="order-3 min-w-0"
          >
            <JevyGuidePanel />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
