import mongoose, { Document } from 'mongoose';

// Interfaz para el documento de proyecto
export interface IProject extends Document {
  title: string;
  description: string;
  image?: string;
  github: string;
  demo: string;
  category: 'fullstack' | 'backend';
  tags: string[];
  createdAt: Date;
  translations?: {
    en?: {
      title: string;
      description: string;
    };
    fr?: {
      title: string;
      description: string;
    };
    it?: {
      title: string;
      description: string;
    };
  };
}

const ProjectSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  image: String,
  github: String,
  demo: String,
  category: { 
    type: String, 
    enum: ['fullstack', 'backend'], 
    required: true 
  },
  tags: {
    type: [String],
    default: []
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  translations: {
    en: {
      title: String,
      description: String,
    },
    fr: {
      title: String,
      description: String,
    },
    it: {
      title: String,
      description: String,
    }
  }
}, { 
  timestamps: true 
});

export default mongoose.models.Project as mongoose.Model<IProject> || mongoose.model<IProject>('Project', ProjectSchema);