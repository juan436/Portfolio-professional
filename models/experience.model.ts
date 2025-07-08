import mongoose, { Document } from 'mongoose';

// Interfaz para el documento de experiencia
export interface IExperience extends Document {
  position: string;
  company: string;
  period: string;
  description: string;
  skills?: string[];
  companyLogo?: string;
  location?: string;
  url?: string;
  translations?: {
    en?: {
      position: string;
      description: string;
      location?: string;
    };
    fr?: {
      position: string;
      description: string;
      location?: string;
    };
    it?: {
      position: string;
      description: string;
      location?: string;
    };
  };
}

const ExperienceSchema = new mongoose.Schema({
  position: { 
    type: String, 
    required: true 
  },
  company: { 
    type: String, 
    required: true 
  },
  period: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  skills: [String],
  companyLogo: String,
  location: String,
  url: String,
  translations: {
    en: {
      position: String,
      description: String,
      location: String,
    },
    fr: {
      position: String,
      description: String,
      location: String,
    },
    it: {
      position: String,
      description: String,
      location: String,
    }
  }
}, { 
  timestamps: true 
});

export default mongoose.models.Experience as mongoose.Model<IExperience> || 
  mongoose.model<IExperience>('Experience', ExperienceSchema);