import mongoose, { Document } from 'mongoose';

/**
 * Markdown convertido de un archivo que el lead adjuntó en el chat de Jevy.
 * El original crudo vive en R2 (`leads/{sessionId}/…`), este documento guarda
 * solo el texto extraído (por `markdown-transformer`) para que sobreviva a un
 * reload de la página: `/api/contact/chat` lo lee por `sessionId` y lo arma
 * como contexto, en vez de que el navegador re-mande el PDF entero en cada
 * turno.
 *
 * Es una caché de trabajo, no un registro permanente — el TTL de 7 días borra
 * las sesiones abandonadas. Al cerrar la charla, `closeConversation` copia el
 * markdown al Lead/JobOffer (campo `attachments[].markdown`), que sí es
 * permanente.
 */
const TTL_SECONDS = 7 * 24 * 60 * 60;

export interface ISessionAttachment extends Document {
  sessionId: string;
  filename: string;
  markdown: string;
  type?: string;
  url?: string;
  createdAt: Date;
}

const SessionAttachmentSchema = new mongoose.Schema<ISessionAttachment>(
  {
    sessionId: { type: String, required: true, index: true },
    filename: { type: String, required: true },
    markdown: { type: String, required: true },
    type: String,
    url: String,
    createdAt: { type: Date, default: Date.now, expires: TTL_SECONDS },
  },
  { versionKey: false },
);

// Un markdown por (sesión, archivo) — re-adjuntar el mismo nombre lo reemplaza.
SessionAttachmentSchema.index({ sessionId: 1, filename: 1 }, { unique: true });

export default (mongoose.models.SessionAttachment as mongoose.Model<ISessionAttachment>) ||
  mongoose.model<ISessionAttachment>('SessionAttachment', SessionAttachmentSchema);
