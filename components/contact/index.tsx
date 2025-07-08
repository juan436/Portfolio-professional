"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/hooks/use-language"
import { useContent } from "@/contexts/content"
import { ContactInfo } from "./contact-info"
import { ContactForm } from "./contact-form"
import {useTranslatedContent} from "@/hooks/use-translated-content"

export default function Contact() {
  const { t } = useLanguage()
  const { content } = useContent()
  const { translatedContent } = useTranslatedContent()
  const [translatedTexts, setTranslatedTexts] = useState({
    title: "",
    subtitle: "",
    info: "",
    email: "",
    phone: "",
    location: "",
    formName: "",
    formSubject: "",
    formMessage: "",
    formSend: ""
  })

  // Cargar traducciones después de la hidratación
  useEffect(() => {
    setTranslatedTexts({
      title: String(t("contact.title")),
      subtitle: String(t("contact.subtitle")),
      info: String(t("contact.info")),
      email: String(t("contact.email")),
      phone: String(t("contact.phone")),
      location: String(t("contact.location")),
      formName: String(t("contact.form.name")),
      formSubject: String(t("contact.form.subject")),
      formMessage: String(t("contact.form.message")),
      formSend: String(t("contact.form.send"))
    })
  }, [t])

  return (
    <section id="contact" className="py-20 relative">
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{translatedTexts.title}</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
          <p className="text-slate-400 max-w-2xl mx-auto">{translatedTexts.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="md:col-span-1"
          >
            <ContactInfo 
              translatedTexts={translatedTexts} 
              contactInfo={translatedContent.contact} 
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="md:col-span-2"
          >
            <ContactForm translatedTexts={translatedTexts} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
