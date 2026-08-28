/**
 * Forma de un post de blog tal como lo consumen las vistas públicas (crudo de
 * Mongo, ya serializado a plano). Antes estaba declarada por separado en
 * `blog-list-view.tsx` y `blog-detail-view.tsx`.
 */
export interface BlogPostLocaleFields {
  title?: string
  excerpt?: string
  body?: string
}

export interface BlogPostView {
  _id: string
  title: string
  slug: string
  excerpt: string
  coverImage?: string
  body: string
  tags?: string[]
  publishedAt?: string
  translations?: {
    en?: BlogPostLocaleFields
    fr?: BlogPostLocaleFields
    it?: BlogPostLocaleFields
  }
}
