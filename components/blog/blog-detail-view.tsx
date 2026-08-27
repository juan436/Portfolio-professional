"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Calendar, Check, Clock, Linkedin, LinkIcon } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { readingMinutes } from "@/lib/blog/text"

interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  coverImage?: string
  body: string
  tags?: string[]
  publishedAt?: string
  translations?: {
    en?: { title?: string; excerpt?: string; body?: string }
    fr?: { title?: string; excerpt?: string; body?: string }
    it?: { title?: string; excerpt?: string; body?: string }
  }
}

const LOCALES: Record<string, string> = { es: "es-ES", en: "en-US", fr: "fr-FR", it: "it-IT" }

// Foto real ya usada en el JSON-LD global (Person) — mismo activo, sin
// inventar una nueva. Ver app/components/json-ld.tsx.
const AUTHOR_PHOTO = "https://images.jvserver.com/images/profile/perfil-1751953703604-489800455.jpeg"
const AUTHOR_NAME = "Ing. Juan Villegas"
const SITE_URL = "https://jevy.dev"

function pickTranslated(post: BlogPost, code: string) {
  const translated = post.translations?.[code as "en" | "fr" | "it"]
  return {
    title: code === "es" ? post.title : translated?.title || post.title,
    body: code === "es" ? post.body : translated?.body || post.body,
  }
}

/**
 * Vista de detalle de un post de blog (`/blog/[slug]`).
 * Recibe: `post` (crudo, con traducciones), `bodyByLang` (cuerpo ya resaltado
 * por el server, por idioma), `related` (hasta 3 posts) y `isPreview`.
 * Produce: fecha/tiempo de lectura/título/tags/portada + membrete de autor +
 * cuerpo como HTML (`.blog-content`) + compartir + "seguir leyendo".
 */
export function BlogDetailView({
  post,
  bodyByLang = {},
  related = [],
  isPreview = false,
}: {
  post: BlogPost | null
  bodyByLang?: Record<string, string>
  related?: BlogPost[]
  isPreview?: boolean
}) {
  const { language, t } = useLanguage()
  const [copied, setCopied] = useState(false)

  const backLabel = String(t("blog.backToBlog") || "Volver al blog")
  const authorRole = String(t("blog.authorRole") || "")
  const notFoundLabel = String(t("blog.notFound") || "No encontramos este artículo.")
  const shareLabel = String(t("blog.share") || "Compartir")
  const copyLabel = String(t("blog.copyLink") || "Copiar enlace")
  const copiedLabel = String(t("blog.linkCopied") || "Enlace copiado")
  const relatedLabel = String(t("blog.relatedTitle") || "Seguir leyendo")

  const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleDateString(LOCALES[language.code] || "es-ES", { year: "numeric", month: "long", day: "numeric" }) : ""

  const readingLabel = (html: string) =>
    String(t("blog.readingTime") || "{{min}} min de lectura").replace("{{min}}", String(readingMinutes(html)))

  if (!post) {
    return (
      <main className="min-h-screen bg-black flex flex-col items-center justify-center px-6 text-center">
        <p className="text-slate-400 mb-6">{notFoundLabel}</p>
        <Link href="/blog" className="text-blue-500 hover:text-blue-400 inline-flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {backLabel}
        </Link>
      </main>
    )
  }

  const { title, body } = pickTranslated(post, language.code)
  const renderedBody = bodyByLang[language.code] || bodyByLang.es || body
  const url = `${SITE_URL}/blog/${post.slug}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard bloqueado: sin acción */
    }
  }

  return (
    <main className="min-h-screen bg-black">
      <section className="pt-32 pb-20 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
        </div>

        <div className="container mx-auto px-6 relative z-10 max-w-5xl">
          {isPreview && (
            <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-300">
              Vista previa — así se verá el artículo al publicarse.
            </div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-6">{title}</h1>

            <div className="flex items-center gap-3 mb-8">
              <img src={AUTHOR_PHOTO} alt={AUTHOR_NAME} className="w-11 h-11 rounded-full object-cover border border-blue-500/30" />
              <div>
                <p className="text-sm font-semibold text-white leading-tight">{AUTHOR_NAME}</p>
                <p className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 leading-tight mt-0.5">
                  {authorRole && <span>{authorRole}</span>}
                  {authorRole && <span aria-hidden>·</span>}
                  <Calendar className="h-3 w-3" />
                  {formatDate(post.publishedAt)}
                  <span aria-hidden>·</span>
                  <Clock className="h-3 w-3" />
                  {readingLabel(body)}
                </p>
              </div>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:border-blue-500/50 text-xs px-2 py-0.5 rounded uppercase font-bold tracking-tighter transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {post.coverImage && (
              <div className="rounded-xl overflow-hidden border border-white/10 mb-10">
                <img src={post.coverImage} alt={title} className="w-full h-auto" />
              </div>
            )}

            <div className="blog-content" dangerouslySetInnerHTML={{ __html: renderedBody }} />

            {!isPreview && (
              <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center gap-3">
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
            )}
          </motion.div>

          {!isPreview && related.length > 0 && (
            <div className="mt-16 pt-10 border-t border-white/10">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">{relatedLabel}</p>
              <div className="flex flex-col gap-5">
                {related.map((item) => {
                  const rel = pickTranslated(item, language.code)
                  return (
                    <Link key={item._id} href={`/blog/${item.slug}`} className="group">
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{rel.title}</h3>
                      <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        {formatDate(item.publishedAt)}
                        <span aria-hidden>·</span>
                        <Clock className="h-3 w-3" />
                        {readingLabel(rel.body)}
                        <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                      </p>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
