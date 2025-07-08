import mongoose, { Document } from 'mongoose';

// Interfaz para el documento de habilidad
export interface ISkill extends Document {
  name: string;
  icon: string;
  colored?: boolean;
  category: 'frontend' | 'backend' | 'database' | 'devops';
  translations?: {
    en?: {
      name: string;
    };
    fr?: {
      name: string;
    };
    pt?: {
      name: string;
    };
  };
}

const SkillSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  icon: { 
    type: String, 
    required: true 
  },
  colored: { 
    type: Boolean, 
    default: false 
  },
  category: { 
    type: String, 
    enum: ['frontend', 'backend', 'database', 'devops'], 
    required: true 
  },
  translations: {
    en: {
      name: String
    },
    fr: {
      name: String
    },
    pt: {
      name: String
    }
  }
}, { 
  timestamps: true 
});

export default mongoose.models.Skill as mongoose.Model<ISkill> || 
  mongoose.model<ISkill>('Skill', SkillSchema);