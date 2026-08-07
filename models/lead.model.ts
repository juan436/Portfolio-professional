import mongoose, { Document } from 'mongoose';

export interface ILead extends Document {
  type: 'client' | 'recruiter';
  name: string;
  email: string;
  preferredChannel: 'email' | 'whatsapp' | 'telegram';
  channelContact?: string;
  problem: string;
  whatTheyWant: string;
  estimatedAmount?: string;
  expectedTimeline?: string;
  projectMatch?: mongoose.Types.ObjectId;
  interestLevel: 'high' | 'medium' | 'low';
  transcript: {
    role: 'jevy' | 'lead';
    text: string;
  }[];
  status: 'new' | 'contacted' | 'closed';
  createdAt: Date;
}

const LeadSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['client', 'recruiter'],
    required: true
  },
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
    enum: ['email', 'whatsapp', 'telegram'],
    required: true
  },
  channelContact: String,
  problem: {
    type: String,
    required: true
  },
  whatTheyWant: {
    type: String,
    required: true
  },
  estimatedAmount: String,
  expectedTimeline: String,
  projectMatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
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
