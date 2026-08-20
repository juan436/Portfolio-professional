import mongoose, { Document } from 'mongoose';

interface ContentBlock {
  kind: 'paragraph' | 'steps';
  text?: string;
  items?: string[];
}

/**
 * Modelo Mongoose de post de blog.
 * Recibe: title/slug/excerpt/body (bloques paragraph|steps)/tags/status, traducciones opcionales.
 * Produce: `BlogPost`, listo para `find`/`create` contra la colección `blogposts`.
 */
// body como bloques (mismo patrón que Project.workProcess/labDetails.testing)
// en vez de markdown/HTML — sin librería nueva, reusa WorkProcessEditor del
// Admin y el mismo criterio de "texto estructurado simple" que ya usa el resto
// del sitio. Ver dev-aguila-azul/vault/portfolio: planes/rediseno-admin-server-actions.
export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  body: ContentBlock[];
  tags?: string[];
  status: 'draft' | 'published';
  publishedAt?: Date;
  translations?: {
    en?: { title?: string; excerpt?: string };
    fr?: { title?: string; excerpt?: string };
    it?: { title?: string; excerpt?: string };
  };
  createdAt: Date;
}

const contentBlockFields = {
  kind: { type: String, enum: ['paragraph', 'steps'] },
  text: String,
  items: { type: [String], default: [] },
};

const BlogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  coverImage: String,
  body: { type: [contentBlockFields], default: [] },
  tags: { type: [String], default: [] },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  publishedAt: Date,
  translations: {
    en: { title: String, excerpt: String },
    fr: { title: String, excerpt: String },
    it: { title: String, excerpt: String },
  },
}, {
  timestamps: true,
});

export default mongoose.models.BlogPost as mongoose.Model<IBlogPost> || mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);
