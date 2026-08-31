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
  content: string;
  type: 'personal' | 'resultado';
  rating: number;
  links: {
    type: 'proyecto' | 'automatizacion';
    ref: string;
  }[];
  status: 'pending' | 'approved';
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
        ref: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
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
