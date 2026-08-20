"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Calendar } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

interface ContentBlock {
  kind: "paragraph" | "steps"
  text?: string
  items?: string[]
}

interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  coverImage?: string
  body: ContentBlock[]
  tags?: string[]
  publishedAt?: string
  translations?: { en?: { title?: string; excerpt?: string }; fr?: { title?: string; excerpt?: string }; it?: { title?: string; excerpt?: string } }
}

const LOCALES: Record<string, string> = { es: "es-ES", en: "en-US", fr: "fr-FR", it: "it-IT" }

function BlogBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, bi) =>
        block.kind === "paragraph" ? (
          block.text && (
            <p key={bi} className="text-slate-300 leading-relaxed">
              {block.text}
            </p>
          )
        ) : (
          block.items &&
          block.items.length > 0 && (
            <ul key={bi} className="space-y-3 list-disc list-inside">
              {block.items.map((item, i) => (
                <li key={i} className="text-slate-300 leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          )
        )
      )}
    </div>
  )
}

/**
 * Vista de detalle de un post de blog (`/blog/[slug]`).
 * Recibe: `post` (crudo, con traducciones) o `null` si no existe.
 * Produce: fecha/título/tags/portada + cuerpo renderizado por bloques (`BlogBlocks`).
 */
export function BlogDetailView({ post }: { post: BlogPost | null }) {
  const { language, t } = useLanguage()

  const backLabel = String(t("projects.backToHome") || "Volver")
  const notFoundLabel = String(t("blog.notFound") || "No encontramos este artículo.")

  const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleDateString(LOCALES[language.code] || "es-ES", { year: "numeric", month: "long", day: "numeric" }) : ""

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

  const translated = post.translations?.[language.code as "en" | "fr" | "it"]
  const title = language.code === "es" ? post.title : translated?.title || post.title

  return (
    <main className="min-h-screen bg-black">
      <section className="pt-32 pb-20 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-20" />
        </div>

        <div className="container mx-auto px-6 relative z-10 max-w-3xl">
          <Link href="/blog" className="text-blue-500 hover:text-blue-400 inline-flex items-center mb-8 text-sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel}
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="flex items-center gap-1.5 text-sm text-slate-500 mb-3">
              <Calendar className="h-4 w-4" />
              {formatDate(post.publishedAt)}
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-6">{title}</h1>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <span key={tag} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs px-2 py-0.5 rounded uppercase font-bold tracking-tighter">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {post.coverImage && (
              <div className="rounded-xl overflow-hidden border border-white/10 mb-10">
                <img src={post.coverImage} alt={title} className="w-full h-auto" />
              </div>
            )}

            <BlogBlocks blocks={post.body} />
          </motion.div>
        </div>
      </section>
    </main>
  )
}
