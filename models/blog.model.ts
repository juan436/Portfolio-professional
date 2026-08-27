import mongoose, { Document } from 'mongoose';

/**
 * Modelo Mongoose de post de blog.
 * Recibe: title/slug/excerpt/body (HTML)/tags/status, traducciones opcionales.
 * Produce: `BlogPost`, listo para `find`/`create` contra la colección `blogposts`.
 */
// body como HTML producido por un editor rich text (Tiptap) — reemplaza la
// decisión original del 2026-08-19 de usar bloques tipados {kind, text,
// items} para evitar una librería de rich-text. Revisión consciente de esa
// decisión (0 posts existentes al momento del cambio, sin migración de
// datos). Ver dev-aguila-azul/vault/portfolio: sesión del blog rich-text.
export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  body: string;
  tags?: string[];
  status: 'draft' | 'published';
  publishedAt?: Date;
  translations?: {
    en?: { title?: string; excerpt?: string; body?: string };
    fr?: { title?: string; excerpt?: string; body?: string };
    it?: { title?: string; excerpt?: string; body?: string };
  };
  createdAt: Date;
}

const localeBlogFields = { title: String, excerpt: String, body: String };

const BlogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  coverImage: String,
  body: { type: String, default: '' },
  tags: { type: [String], default: [] },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  publishedAt: Date,
  translations: {
    en: localeBlogFields,
    fr: localeBlogFields,
    it: localeBlogFields,
  },
}, {
  timestamps: true,
});

export default mongoose.models.BlogPost as mongoose.Model<IBlogPost> || mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);
