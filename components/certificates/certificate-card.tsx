"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Award, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export interface Certificate {
  _id: string
  slug: string
  title: string
  issuer: string
  category?: string
  date: string
  duration?: string
  credentialUrl?: string
}

/**
 * Card de certificación (grid de /certificates).
 * Recibe: `certificate`/`index`/`verifyLabel`/`formatDate` (helpers inyectados por el caller).
 * Produce: link a `/certificates/{slug}` + botón "ver credencial" si tiene `credentialUrl`.
 */
interface CertificateCardProps {
  certificate: Certificate
  index: number
  verifyLabel: string
  formatDate: (date: string) => string
}

export function CertificateCard({ certificate: cert, index, verifyLabel, formatDate }: CertificateCardProps) {
  return (
    <motion.div
      key={cert._id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      viewport={{ once: true }}
    >
      <Card className="bg-zinc-900/40 border border-white/10 backdrop-blur-md hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] transition-all duration-500 h-full relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none rounded-xl" />
        <CardContent className="p-6 relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
              <Award className="h-4.5 w-4.5 text-blue-400" />
            </div>
            <span className="text-xs uppercase tracking-wider text-blue-400 font-bold">{cert.issuer}</span>
          </div>

          <Link href={`/certificates/${cert.slug}`}>
            <h3 className="text-base font-bold text-white mb-2 leading-snug hover:text-blue-400 transition-colors line-clamp-2 min-h-[2.75rem]">
              {cert.title}
            </h3>
          </Link>

          <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-4">
            <span>{formatDate(cert.date)}</span>
            {cert.duration && (
              <>
                <span>·</span>
                <span>{cert.duration}</span>
              </>
            )}
          </div>

          {cert.credentialUrl && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="mt-auto border-blue-700/50 text-blue-500 hover:bg-blue-700/10 self-start"
            >
              <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                {verifyLabel}
              </a>
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
