import mongoose, { Document } from 'mongoose';

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
}, {
  timestamps: true
});

export default mongoose.models.Testimonial as mongoose.Model<ITestimonial> || mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
