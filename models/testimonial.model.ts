import mongoose, { Document } from 'mongoose';

/**
 * Modelo Mongoose de testimonio de cliente.
 * Recibe: autor/rol/foto/contenido/rating y `links[]` a los proyectos/automatizaciones que respalda.
 * Produce: `Testimonial`, listo para `find`/`create` contra la colección `testimonials`.
 */
export interface ITestimonial extends Document {
  author: string;
  role?: string;
  email?: string;
  photo?: string;
  // Meta: apuntar a 350-400 caracteres — corto se siente vacío, muy largo cansa.
  content: string;
  type: 'personal' | 'resultado';
  rating: number;
  links: {
    type: 'proyecto' | 'automatizacion';
    ref: string;
  }[];
  // Moderación: los testimonios cargados por Juan desde el Admin pueden entrar
  // directo en 'approved'; los que llegan por el form público SIEMPRE nacen
  // 'pending' (forzado en app/api/testimonials/route.ts, no confía en el body).
  // El GET público solo devuelve 'approved'.
  status: 'pending' | 'approved';
  // Métricas que el cliente sugiere en el form público — candidatas sin
  // verificar. Mismo shape que ProjectStats.metrics para que promoverlas sea
  // directo, pero viven acá hasta que Juan las revisa y las promueve a mano
  // (ProjectStats nunca se escribe directo desde este modelo).
  suggestedMetrics: {
    label: string;
    value: string;
    statType?: string;
  }[];
  createdAt: Date;
}

const TestimonialSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  role: String,
  email: String,
  photo: String,
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['personal', 'resultado'],
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  links: {
    type: [
      {
        type: { type: String, enum: ['proyecto', 'automatizacion'] },
        ref: String,
      }
    ],
    default: []
  },
  status: {
    type: String,
    enum: ['pending', 'approved'],
    default: 'pending',
  },
  suggestedMetrics: {
    type: [
      {
        label: String,
        value: String,
        statType: String,
      }
    ],
    default: []
  },
}, {
  timestamps: true
});

export default mongoose.models.Testimonial as mongoose.Model<ITestimonial> || mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
