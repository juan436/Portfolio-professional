import mongoose, { Document } from 'mongoose';
import type { IAdditionalDetail } from '@/models/lead.model';
import { attachmentFields, type IAttachment } from '@/models/shared-fields';

/**
 * Modelo Mongoose de JobOffer (oferta de reclutador levantada por Jevy).
 * Recibe: datos de contacto + oferta (companyName/role/modality/contractType/etc.), adjuntos y transcript.
 * Produce: `JobOffer`, listo para `find`/`create` contra la colección `jobOffers`.
 */
// JobOffer = reclutador. Separado de Lead a propósito (charla 2026-08-13,
// dev-aguila-azul/vault/portfolio: planes/levantamiento-informacion-jevy) —
// no matchea contra el catálogo de proyectos, no tiene sentido compartir
// schema con Lead.

export interface IJobOffer extends Document {
  name: string;
  email: string;
  preferredChannel: 'email' | 'whatsapp';
  channelContact: string;

  companyName: string;
  role: string;
  techStack?: string;
  modality?: 'remote' | 'onsite' | 'hybrid';
  contractType?: 'freelance' | 'full_time' | 'per_project';
  offeredAmount?: string;
  selectionProcess?: string;

  markdownReport?: string;
  attachments: IAttachment[];
  additionalDetails: IAdditionalDetail[];

  interestLevel: 'high' | 'medium' | 'low';
  transcript: {
    role: 'jevy' | 'lead';
    text: string;
  }[];
  status: 'new' | 'contacted' | 'closed';
  createdAt: Date;
}

const JobOfferSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  preferredChannel: {
    type: String,
    enum: ['email', 'whatsapp'],
    required: true
  },
  channelContact: {
    type: String,
    required: true
  },

  companyName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  techStack: String,
  modality: {
    type: String,
    enum: ['remote', 'onsite', 'hybrid'],
  },
  contractType: {
    type: String,
    enum: ['freelance', 'full_time', 'per_project'],
  },
  offeredAmount: String,
  selectionProcess: String,

  markdownReport: String,
  attachments: {
    type: [attachmentFields()],
    default: []
  },
  additionalDetails: {
    type: [{ topic: { type: String, required: true }, detail: { type: String, required: true } }],
    default: []
  },

  interestLevel: {
    type: String,
    enum: ['high', 'medium', 'low'],
    required: true
  },
  transcript: {
    type: [
      {
        role: { type: String, enum: ['jevy', 'lead'] },
        text: String,
      }
    ],
    default: []
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'closed'],
    default: 'new'
  },
}, {
  timestamps: true
});

export default mongoose.models.JobOffer as mongoose.Model<IJobOffer> || mongoose.model<IJobOffer>('JobOffer', JobOfferSchema);
