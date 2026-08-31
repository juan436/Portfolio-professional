import mongoose, { Document } from 'mongoose';

/**
 * Modelo Mongoose del vocabulario de matching de Jevy (singleton).
 * Recibe: 4 listas de entradas (categorias/subtypes/problemasCore/sectores), cada una {value,label,definicion}.
 * Produce: `JevyTaxonomy`, consumido por `lib/matching.ts` para construir el enum de function calling de DeepSeek.
 */

export interface IJevyTaxonomyEntry {
  value: string;
  label: string;
  definicion: string;
}

export interface IJevyTaxonomy extends Document {
  categorias: IJevyTaxonomyEntry[];
  subtypes: IJevyTaxonomyEntry[];
  problemasCore: IJevyTaxonomyEntry[];
  sectores: IJevyTaxonomyEntry[];
}

function entryFields() {
  return {
    value: { type: String, required: true },
    label: { type: String, required: true },
    definicion: { type: String, required: true },
  };
}

const JevyTaxonomySchema = new mongoose.Schema(
  {
    categorias: { type: [entryFields()], default: [] },
    subtypes: { type: [entryFields()], default: [] },
    problemasCore: { type: [entryFields()], default: [] },
    sectores: { type: [entryFields()], default: [] },
  },
  { timestamps: true },
);

export default (mongoose.models.JevyTaxonomy as mongoose.Model<IJevyTaxonomy>) ||
  mongoose.model<IJevyTaxonomy>('JevyTaxonomy', JevyTaxonomySchema);
