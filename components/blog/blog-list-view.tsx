"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Calendar, ArrowRight } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { PaginationControls } from "@/components/pagination-controls"

interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  coverImage?: string
  tags?: string[]
  publishedAt?: string
  translations?: { en?: { title?: string; excerpt?: string }; fr?: { title?: string; excerpt?: string }; it?: { title?: string; excerpt?: string } }
}

const LOCALES: Record<string, string> = { es: "es-ES", en: "en-US", fr: "fr-FR", it: "it-IT" }
const PAGE_SIZE = 6

/**
 * Página `/blog` (client) — grilla paginada de posts publicados.
 * Recibe: `posts: BlogPost[]` (crudo, del Server Component).
 * Produce: grid de cards traducidas al idioma actual + paginación.
 */
export function BlogListView({ posts }: { posts: BlogPost[] }) {
  const { language, t } = useLanguage()
  const [page, setPage] = useState(1)

  const title = String(t("blog.title") || "Blog")
  const subtitle = String(t("blog.subtitle") || "")
  const emptyLabel = String(t("blog.empty") || "")
  const readMoreLabel = String(t("blog.readMore") || "Leer más")

  const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleDateString(LOCALES[language.code] || "es-ES", { year: "numeric", month: "long", day: "numeric" }) : ""

  const visible = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <main className="min-h-screen bg-black flex flex-col">
      <div className="container mx-auto px-6 pt-28 pb-8 flex-grow relative">
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-8 relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-balance text-blue-500 mb-4">{title}</h1>
          <div className="w-20 h-1 bg-blue-600 mx-auto mb-6"></div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>

        {posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {visible.map((post, index) => {
                const translated = post.translations?.[language.code as "en" | "fr" | "it"]
                const postTitle = language.code === "es" ? post.title : translated?.title || post.title
                const excerpt = language.code === "es" ? post.excerpt : translated?.excerpt || post.excerpt

                return (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Link href={`/blog/${post.slug}`} className="block h-full">
                      <div className="h-full rounded-xl border border-white/10 bg-zinc-900/40 overflow-hidden hover:border-blue-500/40 transition-colors">
                        {post.coverImage && (
                          <div className="aspect-video w-full overflow-hidden">
                            <img src={post.coverImage} alt={postTitle} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-5 space-y-3">
                          <p className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(post.publishedAt)}
                          </p>
                          <h2 className="text-lg font-bold text-white">{postTitle}</h2>
                          <p className="text-sm text-slate-400 line-clamp-3">{excerpt}</p>
                          <span className="inline-flex items-center gap-1 text-blue-500 text-sm font-medium">
                            {readMoreLabel}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
            <PaginationControls currentPage={page} totalPages={Math.ceil(posts.length / PAGE_SIZE)} onPageChange={setPage} />
          </>
        ) : (
          <div className="text-center py-20 border border-dashed border-white/5 rounded-2xl bg-white/5 relative z-10">
            <p className="text-slate-500 italic">{emptyLabel}</p>
          </div>
        )}
      </div>
    </main>
  )
}
