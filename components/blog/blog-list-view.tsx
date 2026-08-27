"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Clock } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { PaginationControls } from "@/components/pagination-controls"
import { deriveLongDescription, readingMinutes } from "@/lib/blog/text"

interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  body: string
  coverImage?: string
  tags?: string[]
  publishedAt?: string
  translations?: {
    en?: { title?: string; excerpt?: string; body?: string }
    fr?: { title?: string; excerpt?: string; body?: string }
    it?: { title?: string; excerpt?: string; body?: string }
  }
}

const LOCALES: Record<string, string> = { es: "es-ES", en: "en-US", fr: "fr-FR", it: "it-IT" }
const PAGE_SIZE = 10

function translate(post: BlogPost, langCode: string) {
  const translated = post.translations?.[langCode as "en" | "fr" | "it"]
  const title = langCode === "es" ? post.title : translated?.title || post.title
  const body = langCode === "es" ? post.body : translated?.body || post.body
  const description = deriveLongDescription(body || "") || (langCode === "es" ? post.excerpt : translated?.excerpt || post.excerpt)
  return { title, description, body }
}

/**
 * Página `/blog` (client) — bienvenida + layout de 2 columnas: artículos a la
 * izquierda (destacado + lista paginada), columna angosta de temas a la
 * derecha (con conteo). En móvil la columna de temas va arriba de la lista.
 * Recibe: `posts: BlogPost[]` (crudo, ya ordenado por `publishedAt` desc) y `activeTag`.
 * Produce: label + bienvenida + aside de temas + destacado + lista + paginación.
 */
export function BlogListView({ posts, activeTag }: { posts: BlogPost[]; activeTag?: string }) {
  const { language, t } = useLanguage()
  const [page, setPage] = useState(1)

  useEffect(() => setPage(1), [activeTag])

  const title = String(t("blog.title") || "Blog")
  const topicsHeading = String(t("blog.topics") || "Temas")
  const emptyLabel = String(t("blog.empty") || "")
  const readMoreLabel = String(t("blog.readMore") || "Leer más")
  const latestLabel = String(t("blog.latest") || "Último artículo")
  const allTagsLabel = String(t("blog.allTags") || "Todos")

  const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleDateString(LOCALES[language.code] || "es-ES", { year: "numeric", month: "long", day: "numeric" }) : ""

  const readingLabel = (html: string) =>
    String(t("blog.readingTime") || "{{min}} min de lectura").replace("{{min}}", String(readingMinutes(html)))

  const topics = useMemo(() => {
    const counts = new Map<string, number>()
    for (const post of posts) for (const tag of post.tags || []) counts.set(tag, (counts.get(tag) || 0) + 1)
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => a.tag.localeCompare(b.tag))
  }, [posts])

  const filtered = activeTag ? posts.filter((post) => (post.tags || []).includes(activeTag)) : posts

  const [featured, ...rest] = filtered
  const visibleRest = rest.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <main className="min-h-screen bg-black flex flex-col">
      <div className="container mx-auto px-6 pt-28 pb-8 flex-grow relative">
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

        {posts.length > 0 ? (
          <div className="max-w-7xl mx-auto relative z-10 px-8 md:px-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="mb-10"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{title}</p>
            </motion.div>

            <div className="md:grid md:grid-cols-[1fr_200px] md:gap-x-16">
              {topics.length > 0 && (
                <aside className="mb-10 md:mb-0 md:col-start-2 md:row-start-1">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3">{topicsHeading}</p>
                  <ul className="flex flex-wrap gap-x-4 gap-y-1.5 md:flex-col md:gap-2">
                    <TopicLink href="/blog" label={allTagsLabel} active={!activeTag} />
                    {topics.map(({ tag, count }) => (
                      <TopicLink
                        key={tag}
                        href={`/blog?tag=${encodeURIComponent(tag)}`}
                        label={tag}
                        count={count}
                        active={activeTag === tag}
                      />
                    ))}
                  </ul>
                </aside>
              )}

              <div className="md:col-start-1 md:row-start-1 min-w-0">
                {filtered.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-white/5 rounded-2xl bg-white/5">
                    <p className="text-slate-500 italic">{emptyLabel}</p>
                  </div>
                ) : (
                  <>
                    {page === 1 && featured && (
                      <FeaturedEntry
                        post={featured}
                        langCode={language.code}
                        formatDate={formatDate}
                        latestLabel={activeTag ? undefined : latestLabel}
                        readMoreLabel={readMoreLabel}
                        readingLabel={readingLabel}
                      />
                    )}

                    {visibleRest.length > 0 && (
                      <div className="mt-2 flex flex-col">
                        {visibleRest.map((post, index) => (
                          <EditorialEntry
                            key={post._id}
                            post={post}
                            langCode={language.code}
                            formatDate={formatDate}
                            readMoreLabel={readMoreLabel}
                            readingLabel={readingLabel}
                            index={index}
                          />
                        ))}
                      </div>
                    )}

                    <PaginationControls currentPage={page} totalPages={Math.max(1, Math.ceil(rest.length / PAGE_SIZE))} onPageChange={setPage} />
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-white/5 rounded-2xl bg-white/5 relative z-10 max-w-6xl mx-auto">
            <p className="text-slate-500 italic">{emptyLabel}</p>
          </div>
        )}
      </div>
    </main>
  )
}

function TopicLink({ href, label, count, active }: { href: string; label: string; count?: number; active: boolean }) {
  return (
    <li>
      <Link
        href={href}
        scroll={false}
        className={`inline-flex items-baseline gap-1.5 text-sm transition-colors ${
          active ? "text-white font-semibold" : "text-slate-500 hover:text-slate-300"
        }`}
      >
        {label}
        {typeof count === "number" && <span className="text-[11px] text-slate-600">{count}</span>}
      </Link>
    </li>
  )
}

function FeaturedEntry({
  post,
  langCode,
  formatDate,
  latestLabel,
  readMoreLabel,
  readingLabel,
}: {
  post: BlogPost
  langCode: string
  formatDate: (date?: string) => string
  latestLabel?: string
  readMoreLabel: string
  readingLabel: (html: string) => string
}) {
  const { title, description, body } = translate(post, langCode)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Link
        href={`/blog/${post.slug}`}
        className="group relative block rounded-2xl border border-blue-700/20 p-8 md:p-10 overflow-hidden bg-gradient-to-br from-blue-700/[0.12] to-transparent hover:border-blue-500/40 transition-colors"
      >
        <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

        {latestLabel && <p className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4 relative z-10">{latestLabel}</p>}
        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4 text-balance group-hover:text-blue-400 transition-colors relative z-10">
          {title}
        </h2>
        <p className="text-slate-300 text-lg leading-relaxed mb-5 relative z-10">{description}</p>

        <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 mb-5 relative z-10">
          <span>{formatDate(post.publishedAt)}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {readingLabel(body)}
          </span>
          {post.tags && post.tags.length > 0 && <span aria-hidden>·</span>}
          {post.tags?.map((tag) => (
            <span key={tag} className="bg-blue-500/10 text-blue-400 rounded px-2 py-0.5 text-[11px] font-semibold">
              {tag}
            </span>
          ))}
        </div>

        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-500 relative z-10">
          {readMoreLabel}
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </Link>
    </motion.div>
  )
}

function EditorialEntry({
  post,
  langCode,
  formatDate,
  readMoreLabel,
  readingLabel,
  index,
}: {
  post: BlogPost
  langCode: string
  formatDate: (date?: string) => string
  readMoreLabel: string
  readingLabel: (html: string) => string
  index: number
}) {
  const { title, description, body } = translate(post, langCode)

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: index * 0.05 }}>
      <Link href={`/blog/${post.slug}`} className="group block py-8 border-t border-white/[0.08]">
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 mb-3">
          <span>{formatDate(post.publishedAt)}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {readingLabel(body)}
          </span>
          {post.tags && post.tags.length > 0 && <span aria-hidden>·</span>}
          {post.tags?.map((tag) => (
            <span key={tag} className="bg-blue-500/10 text-blue-400 rounded px-2 py-0.5 text-[11px] font-semibold">
              {tag}
            </span>
          ))}
        </div>

        <h3 className="text-2xl font-extrabold text-white leading-snug mb-2.5 text-balance group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <p className="text-slate-400 text-lg leading-relaxed mb-3">{description}</p>

        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-500">
          {readMoreLabel}
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </Link>
    </motion.div>
  )
}
