import mongoose, { Document } from 'mongoose';
import { attachmentFields, type IAttachment } from '@/models/shared-fields';

// Lead = solo cliente. El reclutador vive en su propia colección (JobOffer)
// — los datos son demasiado distintos como para forzarlos en campos
// genéricos compartidos. Ver dev-aguila-azul/vault/portfolio:
// planes/levantamiento-informacion-jevy.

export type { IAttachment };

export interface IAdditionalDetail {
  topic: string;
  detail: string;
}

export interface ILead extends Document {
  name: string;
  email: string;
  preferredChannel: 'email' | 'whatsapp';
  channelContact: string;

  problem: string;
  whatTheyWant: string;
  stakeholders?: string;
  currentProcess?: string;
  outOfScope?: string;
  priorities?: string;
  successCriteria?: string;

  estimatedAmount?: string;
  expectedTimeline?: string;

  projectMatch?: mongoose.Types.ObjectId;

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

const LeadSchema = new mongoose.Schema({
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

  problem: {
    type: String,
    required: true
  },
  whatTheyWant: {
    type: String,
    required: true
  },
  stakeholders: String,
  currentProcess: String,
  outOfScope: String,
  priorities: String,
  successCriteria: String,

  estimatedAmount: String,
  expectedTimeline: String,

  projectMatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },

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

export default mongoose.models.Lead as mongoose.Model<ILead> || mongoose.model<ILead>('Lead', LeadSchema);
