"use client"

import { useState } from "react"
import { Check, Linkedin, LinkIcon } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

/**
 * Fila "Compartir" — LinkedIn (`share-offsite`, abre el compositor con la URL) +
 * "copiar enlace" (clipboard + check de 2s). Compartida entre el blog y las
 * vistas de detalle (proyectos/automatizaciones/agentes).
 * Recibe: `url` (URL pública completa de la ficha).
 * Ver portfolio: planes/compartir-fichas-linkedin-2026-08-27.
 */
export function ShareRow({ url, className }: { url: string; className?: string }) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  const shareLabel = String(t("common.share") || "Compartir")
  const copyLabel = String(t("common.copyLink") || "Copiar enlace")
  const copiedLabel = String(t("common.linkCopied") || "Enlace copiado")

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
    }
  }

  return (
    <div className={className ?? "mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center gap-3"}>
      <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{shareLabel}</span>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-400 transition-colors"
      >
        <Linkedin className="h-4 w-4" />
        LinkedIn
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-400 transition-colors"
      >
        {copied ? <Check className="h-4 w-4 text-blue-400" /> : <LinkIcon className="h-4 w-4" />}
        {copied ? copiedLabel : copyLabel}
      </button>
    </div>
  )
}
