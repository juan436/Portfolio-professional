"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useLanguage } from "@/hooks/use-language"
import { CertificateCard, type Certificate } from "@/components/certificates/certificate-card"
import { PaginationControls } from "@/components/pagination-controls"

const LOCALES: Record<string, string> = {
  es: "es-ES",
  en: "en-US",
  fr: "fr-FR",
  it: "it-IT",
}

const PAGE_SIZE = 6

/**
 * Página `/certificates` (client) — grilla paginada de certificaciones.
 * Recibe: `certificates: Certificate[]` (crudo, del Server Component).
 * Produce: grid de `CertificateCard` + paginación.
 */
export function CertificatesListView({ certificates }: { certificates: Certificate[] }) {
  const { language, t } = useLanguage()
  const [page, setPage] = useState(1)

  const verifyLabel = String(t("certificates.verify") || "Ver credencial")
  const emptyLabel = String(t("certificates.empty") || "")

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(LOCALES[language.code] || "es-ES", { year: "numeric", month: "long" })

  return (
    <main className="min-h-screen bg-black flex flex-col">
      <div className="container mx-auto px-6 pt-28 pb-8 flex-grow relative">
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 relative z-10"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-balance text-blue-500 mb-4">
            {String(t("certificates.title") || "Certificaciones")}
          </h1>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">{String(t("certificates.subtitle") || "")}</p>
        </motion.div>

        {certificates.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {certificates.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((cert, index) => {
                const tr =
                  language.code === "es"
                    ? undefined
                    : (cert as { translations?: Record<string, { title?: string; issuer?: string }> }).translations?.[language.code]
                return (
                  <CertificateCard
                    key={cert._id}
                    certificate={{ ...cert, title: tr?.title || cert.title, issuer: tr?.issuer || cert.issuer }}
                    index={index}
                    verifyLabel={verifyLabel}
                    formatDate={formatDate}
                  />
                )
              })}
            </div>
            <PaginationControls
              currentPage={page}
              totalPages={Math.ceil(certificates.length / PAGE_SIZE)}
              onPageChange={setPage}
            />
          </>
        ) : (
          emptyLabel && (
            <div className="text-center py-20 border border-dashed border-white/5 rounded-2xl bg-white/5 relative z-10">
              <p className="text-slate-500 italic">{emptyLabel}</p>
            </div>
          )
        )}
      </div>
    </main>
  )
}
