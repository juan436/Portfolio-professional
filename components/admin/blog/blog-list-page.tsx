"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Trash2, Newspaper } from "lucide-react"
import AdminLayout from "@/components/admin/layout/admin-layout"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ConfirmationDialog } from "@/components/admin/common/confirmation-dialog"
import { useToastNotifications } from "@/hooks/admin/use-toast-notifications"
import { listBlogPostsAction, deleteBlogPostAction } from "@/lib/actions/blog"

interface BlogPostRow {
  _id: string
  title: string
  status: "draft" | "published"
  updatedAt?: string
  publishedAt?: string
  excerpt: string
}

const LOCALE = "es-ES"

/**
 * Página `/admin/blog` — listado completo de posts, punto de entrada al
 * editor a pantalla completa ("Modo Escritura", `/admin/blog/new` y
 * `/admin/blog/[id]`). Reemplaza el tab "Blog" del dashboard.
 * Recibe: nada (carga su propia lista).
 * Produce: grid de posts + acciones (crear/borrar), navegación al editor.
 */
export function BlogListPage() {
  const toastNotifications = useToastNotifications()
  const [posts, setPosts] = useState<BlogPostRow[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [toDelete, setToDelete] = useState<{ id: string; title: string } | null>(null)

  const load = async () => {
    setIsFetching(true)
    try {
      const data = await listBlogPostsAction()
      setPosts(data)
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async () => {
    if (!toDelete) return
    try {
      await deleteBlogPostAction(toDelete.id)
      setPosts((prev) => prev.filter((p) => p._id !== toDelete.id))
      toastNotifications.showDeletedToast("Artículo")
    } catch (error) {
      console.error(error)
      toastNotifications.showErrorToast("Error", "No se pudo eliminar el artículo.")
    } finally {
      setToDelete(null)
    }
  }

  const formatDate = (date?: string) =>
    date ? new Date(date).toLocaleDateString(LOCALE, { year: "numeric", month: "short", day: "numeric" }) : ""

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Blog</h1>
          <Button asChild className="bg-blue-700 hover:bg-blue-800">
            <Link href="/admin/blog/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Artículo
            </Link>
          </Button>
        </div>

        {isFetching ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner size="lg" text="Cargando artículos..." />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-blue-700/20 rounded-2xl">
            <Newspaper className="h-8 w-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No hay artículos todavía.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <Link
                key={post._id}
                href={`/admin/blog/${post._id}`}
                className="group relative bg-black/40 border border-blue-700/20 hover:border-blue-700/50 rounded-lg p-5 transition-colors"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setToDelete({ id: post._id, title: post.title })
                  }}
                  className="absolute right-4 top-4 h-7 w-7 flex items-center justify-center rounded-md text-slate-500 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <span
                  className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded mb-3 ${
                    post.status === "published" ? "bg-blue-500/10 text-blue-400" : "bg-white/5 text-slate-400"
                  }`}
                >
                  {post.status === "published" ? "Publicado" : "Borrador"}
                </span>

                <h3 className="font-bold text-white mb-1.5 pr-6 line-clamp-2">{post.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-3">{post.excerpt}</p>
                <p className="text-xs text-slate-600">{formatDate(post.publishedAt || post.updatedAt)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Eliminar Artículo"
        description={`¿Estás seguro de que deseas eliminar "${toDelete?.title}"?`}
      />
    </AdminLayout>
  )
}
