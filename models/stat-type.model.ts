import mongoose, { Document } from 'mongoose';

/**
 * Modelo Mongoose de tipo de estadística reutilizable.
 * Recibe: key/label/prefix/suffix/gradient de un tipo de métrica.
 * Produce: `StatType`, referenciado por `ProjectStats.metrics[].statType` para sumar al total del home.
 */
export interface IStatType extends Document {
  key: string;
  label: string;
  prefix?: string;
  suffix?: string;
  gradient?: string;
  createdAt: Date;
}

const StatTypeSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  label: {
    type: String,
    required: true
  },
  prefix: String,
  suffix: String,
  gradient: {
    type: String,
    default: 'from-blue-400 to-blue-600'
  },
}, {
  timestamps: true
});

export default mongoose.models.StatType as mongoose.Model<IStatType> || mongoose.model<IStatType>('StatType', StatTypeSchema);
