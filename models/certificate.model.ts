import mongoose, { Document } from 'mongoose';

export interface ICertificate extends Document {
  title: string;
  issuer: string;
  category?: string;
  date: Date;
  duration?: string;
  credentialUrl?: string;
  image?: string;
  techStack?: string[];
  learned?: string;
  applied?: string;
  createdAt: Date;
}

const CertificateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  issuer: {
    type: String,
    required: true,
  },
  category: String,
  date: {
    type: Date,
    required: true,
  },
  duration: String,
  credentialUrl: String,
  image: String,
  techStack: {
    type: [String],
    default: [],
  },
  learned: String,
  applied: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Certificate as mongoose.Model<ICertificate> || mongoose.model<ICertificate>('Certificate', CertificateSchema);
