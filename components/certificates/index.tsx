"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { CertificateCard, type Certificate } from "./certificate-card"

const LOCALES: Record<string, string> = {
  es: "es-ES",
  en: "en-US",
  fr: "fr-FR",
  it: "it-IT",
}

const HOME_LIMIT = 3

export default function Certificates() {
  const { language, t } = useLanguage()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsMounted(true)

    const fetchCertificates = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/certificates')
        const result = await response.json()

        if (result.success && Array.isArray(result.data)) {
          setCertificates(result.data)
        }
      } catch (error) {
        console.error('Error fetching certificates:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCertificates()
  }, [])

  if (!isMounted) return null

  const title = String(t("certificates.title") || "Certificaciones")
  const subtitle = String(t("certificates.subtitle") || "")
  const verifyLabel = String(t("certificates.verify") || "Ver credencial")
  const emptyLabel = String(t("certificates.empty") || "")
  const viewMoreLabel = String(t("certificates.viewMore") || "Ver todas las certificaciones")

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(LOCALES[language.code] || "es-ES", { year: "numeric", month: "long" })

  const visibleCertificates = certificates.slice(0, HOME_LIMIT)

  return (
    <section id="certificates" className="py-24 bg-black relative overflow-hidden">
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-2">{title}</h2>
          {subtitle && <p className="text-slate-400 mb-8 max-w-2xl mx-auto">{subtitle}</p>}
          <div className="w-20 h-1 bg-blue-600 mb-8 mx-auto" />
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : visibleCertificates.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleCertificates.map((cert, index) => (
                <CertificateCard
                  key={cert._id}
                  certificate={cert}
                  index={index}
                  verifyLabel={verifyLabel}
                  formatDate={formatDate}
                />
              ))}
            </div>

            {certificates.length > HOME_LIMIT && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="mt-12 flex justify-center"
              >
                <Link
                  href="/certificates"
                  className="group inline-flex items-center border border-blue-700/50 text-blue-500 hover:bg-blue-700/10 hover:border-blue-500 transition-all duration-300 rounded-md px-4 py-2 text-sm font-medium"
                >
                  {viewMoreLabel}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            )}
          </>
        ) : (
          emptyLabel && (
            <div className="text-center py-20 border border-dashed border-white/5 rounded-2xl bg-white/5">
              <p className="text-slate-500 italic">{emptyLabel}</p>
            </div>
          )
        )}
      </div>
    </section>
  )
}
