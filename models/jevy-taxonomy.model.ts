import mongoose, { Document } from 'mongoose';

/**
 * Modelo Mongoose del vocabulario de matching de Jevy (singleton).
 * Recibe: 4 listas de entradas (categorias/subtypes/problemasCore/sectores), cada una {value,label,definicion}.
 * Produce: `JevyTaxonomy`, consumido por `lib/matching.ts` para construir el enum de function calling de DeepSeek.
 */
// Vocabulario cerrado del motor de matching de Jevy — vive en Mongo (no en código)
// para poder crecer sin redeploy. Singleton: un solo documento en la colección,
// igual que el patrón ya usado por Content. Semilla inicial: scripts/seed-jevy-taxonomy.ts.
//
// `definicion` es lo que se le pasa a DeepSeek en la descripción de la función de
// extracción (function calling) — sin eso el modelo tiene que adivinar qué significa
// cada valor del enum. Ver dev-aguila-azul/vault/portfolio: planes/matching-catalogo-function-calling.

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
