import mongoose, { Document } from 'mongoose';

export interface IProjectStats extends Document {
  link: {
    type: 'proyecto' | 'automatizacion';
    ref: string;
  };
  // Solo datos medibles/verificables (%, tiempo, conteo, $). Nunca frases
  // ambiguas ("24/7", "inmediato") — si no se puede medir, no es una métrica.
  // Las carga el dueño del sitio, no depende de lo que escriba el cliente.
  metrics: {
    label: string;
    value: string;
    // Opcional: si referencia una key de StatType, esta métrica suma al total
    // acumulado que se muestra en el home. Si no tiene, queda solo en este proyecto.
    statType?: string;
  }[];
  createdAt: Date;
}

const ProjectStatsSchema = new mongoose.Schema({
  link: {
    type: { type: String, enum: ['proyecto', 'automatizacion'], required: true },
    ref: { type: String, required: true },
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
