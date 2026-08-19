"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Award, Briefcase, Calendar, Clock, ExternalLink, Layers, Lightbulb } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { fetchCertificateById } from "@/services/api/certificates"
import { ProjectHeader } from "@/components/projects/project-header"
import { Button } from "@/components/ui/button"

interface RawCertificate {
  _id: string
  title: string
  issuer: string
  category?: string
  date: string
  duration?: string
  credentialUrl?: string
  image?: string
  techStack?: string[]
  learned?: string
  applied?: string
}

const LOCALES: Record<string, string> = {
  es: "es-ES",
  en: "en-US",
  fr: "fr-FR",
  it: "it-IT",
}

export default function CertificateDetailPage() {
  const params = useParams<{ id: string }>()
  const { language, t } = useLanguage()
  const [certificate, setCertificate] = useState<RawCertificate | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    fetchCertificateById(params.id).then((data) => {
      if (!data) {
        setNotFound(true)
        return
      }
      setCertificate(data)
    })
  }, [params.id])

  const backLabel = String(t("projects.backToHome") || "Volver")
  const notFoundLabel = String(t("certificates.notFound") || "No encontramos este certificado.")
  const verifyLabel = String(t("certificates.verify") || "Ver credencial")
  const techStackHeading = String(t("certificates.techStackHeading") || "Tecnologías cubiertas")
  const learnedHeading = String(t("certificates.learnedHeading") || "Qué aprendí")
  const appliedHeading = String(t("certificates.appliedHeading") || "Cómo lo apliqué")
  const issuerLabel = String(t("certificates.issuerLabel") || "Emitido por")
  const dateLabel = String(t("certificates.dateLabel") || "Fecha")
  const durationLabel = String(t("certificates.durationLabel") || "Duración")

  if (notFound) {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center">
        <p className="text-slate-400 mb-6">{notFoundLabel}</p>
        <Link href="/certificates" className="text-blue-500 hover:text-blue-400 inline-flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {backLabel}
        </Link>
      </main>
    )
  }

  if (!isMounted || !certificate) return null

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(LOCALES[language.code] || "es-ES", { year: "numeric", month: "long" })

  return (
    <main className="min-h-screen bg-black">
      <section className="pt-32 pb-20 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
        </div>

        <div className="container mx-auto px-6 relative z-10 max-w-6xl">
          <ProjectHeader title={certificate.title} description={certificate.issuer} hideHeader backHref="/certificates" />

          <div className="grid grid-cols-1 lg:grid-cols-9 gap-8 mb-12 items-start">
            {certificate.image && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="lg:col-span-7 rounded-xl overflow-hidden border border-white/10 bg-white"
              >
                <img src={certificate.image} alt={certificate.title} className="w-full h-auto" />
              </motion.div>
            )}

            <div className="lg:col-span-2 flex flex-col gap-3">
              {certificate.credentialUrl && (
                <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500 justify-start">
                  <a href={certificate.credentialUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {verifyLabel}
                  </a>
                </Button>
              )}
              <div className="px-3 py-2 rounded-xl bg-zinc-900/40 border border-white/5">
                <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                  <Award className="h-3.5 w-3.5 text-blue-500" />
                  {issuerLabel}
                </p>
                <p className="text-sm font-bold text-white break-words">{certificate.issuer}</p>
              </div>
              <div className="px-3 py-2 rounded-xl bg-zinc-900/40 border border-white/5">
                <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                  <Calendar className="h-3.5 w-3.5 text-blue-500" />
                  {dateLabel}
                </p>
                <p className="text-sm font-bold text-white break-words capitalize">{formatDate(certificate.date)}</p>
              </div>
              {certificate.duration && (
                <div className="px-3 py-2 rounded-xl bg-zinc-900/40 border border-white/5">
                  <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                    <Clock className="h-3.5 w-3.5 text-blue-500" />
                    {durationLabel}
                  </p>
                  <p className="text-sm font-bold text-white break-words">{certificate.duration}</p>
                </div>
              )}

              {certificate.techStack && certificate.techStack.length > 0 && (
                <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/5">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-2 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" />
                    {techStackHeading}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {certificate.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-tighter"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            {certificate.learned && (
              <div className="p-6 rounded-xl bg-zinc-900/40 border border-white/5">
                <h3 className="text-sm font-bold uppercase tracking-wide text-blue-400 mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  {learnedHeading}
                </h3>
                <p className="text-slate-300 leading-relaxed text-sm">{certificate.learned}</p>
              </div>
            )}

            {certificate.applied && (
              <div className="p-6 rounded-xl bg-zinc-900/40 border border-white/5">
                <h3 className="text-sm font-bold uppercase tracking-wide text-blue-400 mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  {appliedHeading}
                </h3>
                <p className="text-slate-300 leading-relaxed text-sm">{certificate.applied}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
