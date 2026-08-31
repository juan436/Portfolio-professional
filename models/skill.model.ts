import mongoose, { Document } from 'mongoose';

/**
 * Modelo Mongoose de habilidad técnica (frontend/backend/database/devops).
 * Recibe: name/icon/colored/category + traducciones opcionales en/fr/it.
 * Produce: `Skill`, listo para `find`/`create` contra la colección `skills`.
 */
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
    it?: {
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
    it: {
      name: String
    }
  }
}, { 
  timestamps: true 
});

export default mongoose.models.Skill as mongoose.Model<ISkill> || 
  mongoose.model<ISkill>('Skill', SkillSchema);
