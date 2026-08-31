/**
 * Campos de schema Mongoose compartidos entre modelos que no ameritan su
 * propio archivo. `attachmentFields()` vivía copiado igual en lead.model.ts y
 * joboffer.model.ts (auditoría 2026-08-18 §6.10).
 * Recibe: nada (fábrica sin argumentos).
 * Produce: el fragmento de schema Mongoose para un adjunto (filename/type/url/extractedNote/markdown).
 */
export interface IAttachment {
  filename: string;
  type: string;
  url: string;
  extractedNote?: string;
  markdown?: string;
}

export function attachmentFields() {
  return {
    filename: { type: String, required: true },
    type: { type: String, required: true },
    url: { type: String, required: true },
    extractedNote: String,
    markdown: String,
  };
}
