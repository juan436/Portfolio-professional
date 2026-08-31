import mongoose, { Document } from 'mongoose';

/**
 * Modelo Mongoose de métricas de un proyecto/automatización.
 * Recibe: `link` (a qué proyecto/automatización pertenece) + `metrics[]` (label/value medibles).
 * Produce: `ProjectStats`, listo para `find`/`create` contra la colección `projectstats`.
 */
export interface IProjectStats extends Document {
  link: {
    type: 'proyecto' | 'automatizacion';
    ref: string;
  };
  metrics: {
    label: string;
    value: string;
    statType?: string;
  }[];
  createdAt: Date;
}

const ProjectStatsSchema = new mongoose.Schema({
  link: {
    type: { type: String, enum: ['proyecto', 'automatizacion'], required: true },
    ref: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  },
  metrics: {
    type: [
      {
        label: String,
        value: String,
        statType: String,
      },
    ],
    default: [],
  },
}, {
  timestamps: true,
});

export default (mongoose.models.ProjectStats as mongoose.Model<IProjectStats>) || mongoose.model<IProjectStats>('ProjectStats', ProjectStatsSchema);
