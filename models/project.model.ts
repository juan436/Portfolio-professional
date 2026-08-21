import mongoose, { Document } from 'mongoose';

/**
 * Modelo Mongoose de proyecto/automatización/agente/laboratorio (entidad central del portfolio).
 * Recibe: campos comunes (title/slug/category/tags/etc.) + un bloque de detalle específico por
 * categoría (labDetails/automationDetails/agentDetails/infraDetails/etc.) + `jevyProfile` (matching, no se renderiza).
 * Produce: `Project`, listo para `find`/`create` contra la colección `projects`.
 */
// Interfaz para el documento de proyecto
export interface IProject extends Document {
  title: string;
  slug: string;
  description: string;
  image?: string;
  images?: string[];
  video?: string;
  github: string;
  demo: string;
  category: 'web' | 'mobile' | 'infra_backend' | 'laboratorio' | 'automatizacion' | 'agente';
  subtype?: string;
  tags: string[];
  duration?: string;
  sector?: string;
  role?: string;
  workProcess?: {
    kind: 'paragraph' | 'steps';
    text?: string;
    items?: string[];
  }[];
  createdAt: Date;
  testimonial?: {
    author: string;
    role: string;
    content: string;
  };
  techStack?: {
    frontend?: string[];
    backend?: string[];
    database?: string[];
    infra?: string[];
  };
  challenge?: {
    problem: string;
    solution: string;
  };
  technicalDecisions?: {
    title: string;
    description: string;
  }[];
  securityHardening?: string[];
  deploymentDiagram?: {
    icon: string;
    label: string;
  }[];
  infraDetails?: {
    uptime?: string;
    capacity?: string;
    monitoring?: string[];
    backupStrategy?: string;
    costOptimized?: string;
  };
  systemDetails?: {
    timeSaved?: string;
    usersManaged?: string;
    capacity?: string;
    integrations?: string[];
    reportsGenerated?: string;
  };
  ecommerceDetails?: {
    paymentGateway?: string[];
    checkoutFlow?: string;
    inventory?: string;
    capacity?: string;
    performanceSeo?: string;
    paymentMethods?: string[];
  };
  mobileDetails?: {
    platforms?: string[];
    storeStatus?: string;
    offlineSupport?: string;
    pushNotifications?: string;
    loadPerformance?: string;
  };
  labDetails?: {
    status?: 'testing' | 'completed' | 'discontinued' | 'evolved';
    testing?: { kind: 'paragraph' | 'steps'; text?: string; items?: string[] }[];
    learnings?: { kind: 'paragraph' | 'steps'; text?: string; items?: string[] }[];
    motivation?: string;
    limitations?: string[];
    nextStep?: string;
    comparison?: string;
    timeInvested?: string;
    flow?: {
      steps?: string[];
      demoPlaceholder?: string;
      demoOutputTemplate?: string;
    };
  };
  automationDetails?: {
    icon?: string;
    useCase?: string;
    tools?: string[];
    channels?: string[];
    setupTime?: string;
    flow?: {
      steps?: string[];
      demoPlaceholder?: string;
      demoOutputTemplate?: string;
      demoMode?: 'text' | 'file';
      demoFileLabel?: string;
    };
  };
  agentDetails?: {
    icon?: string;
    useCase?: string;
    capabilities?: string[];
    channels?: string[];
    tools?: string[];
    setupTime?: string;
    liveDemo?: 'jevy-chat' | 'synapse-chat' | 'none';
  };
  // Objeto dedicado a Jevy (motor de matching) — nunca se renderiza en el front.
  // Nomenclatura propia para la IA, separada de category/subtype/sector (esos son
  // para el visitante humano). Ver dev-aguila-azul/vault/portfolio: planes/matching-catalogo-function-calling.
  jevyProfile?: {
    categoria?: string;
    subtype?: string;
    problemaCore?: string;
    sector?: string;
    pitchCorto?: string;
  };
  translations?: {
    en?: LocaleContent;
    fr?: LocaleContent;
    it?: LocaleContent;
  };
}

interface LocaleContent {
  title?: string;
  description?: string;
  useCase?: string;
  steps?: string[];
  demoPlaceholder?: string;
  demoOutputTemplate?: string;
  tools?: string[];
  channels?: string[];
  setupTime?: string;
  subtype?: string;
  capabilities?: string[];
}

function localeContentFields() {
  return {
    title: String,
    description: String,
    useCase: String,
    steps: { type: [String], default: [] },
    demoPlaceholder: String,
    demoOutputTemplate: String,
    tools: { type: [String], default: [] },
    channels: { type: [String], default: [] },
    setupTime: String,
    subtype: String,
    capabilities: { type: [String], default: [] },
  };
}

const ProjectSchema = new mongoose.Schema({
  title: { 
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true
  },
  image: String,
  images: {
    type: [String],
    default: []
  },
  video: String,
  github: String,
  demo: String,
  category: { 
    type: String, 
    enum: ['web', 'mobile', 'infra_backend', 'laboratorio', 'automatizacion', 'agente'],
    required: true 
  },
  subtype: String,
  tags: {
    type: [String],
    default: []
  },
  duration: String,
  sector: String,
  role: String,
  workProcess: {
    type: [
      {
        kind: { type: String, enum: ['paragraph', 'steps'] },
        text: String,
        items: { type: [String], default: [] },
      }
    ],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  testimonial: {
    author: String,
    role: String,
    content: String,
  },
  techStack: {
    frontend: { type: [String], default: [] },
    backend: { type: [String], default: [] },
    database: { type: [String], default: [] },
    infra: { type: [String], default: [] },
  },
  challenge: {
    problem: String,
    solution: String,
  },
  technicalDecisions: {
    type: [
      {
        title: String,
        description: String,
      }
    ],
    default: []
  },
  securityHardening: {
    type: [String],
    default: []
  },
  deploymentDiagram: {
    type: [
      {
        icon: String,
        label: String,
      }
    ],
    default: []
  },
  infraDetails: {
    uptime: String,
    capacity: String,
    monitoring: { type: [String], default: [] },
    backupStrategy: String,
    costOptimized: String,
  },
  systemDetails: {
    timeSaved: String,
    usersManaged: String,
    capacity: String,
    integrations: { type: [String], default: [] },
    reportsGenerated: String,
  },
  ecommerceDetails: {
    paymentGateway: { type: [String], default: [] },
    checkoutFlow: String,
    inventory: String,
    capacity: String,
    performanceSeo: String,
    paymentMethods: { type: [String], default: [] },
  },
  mobileDetails: {
    platforms: { type: [String], default: [] },
    storeStatus: String,
    offlineSupport: String,
    pushNotifications: String,
    loadPerformance: String,
  },
  labDetails: {
    status: { type: String, enum: ['testing', 'completed', 'discontinued', 'evolved'] },
    testing: {
      type: [
        {
          kind: { type: String, enum: ['paragraph', 'steps'] },
          text: String,
          items: { type: [String], default: [] },
        }
      ],
      default: []
    },
    learnings: {
      type: [
        {
          kind: { type: String, enum: ['paragraph', 'steps'] },
          text: String,
          items: { type: [String], default: [] },
        }
      ],
      default: []
    },
    motivation: String,
    limitations: { type: [String], default: [] },
    nextStep: String,
    comparison: String,
    timeInvested: String,
    flow: {
      steps: { type: [String], default: [] },
      demoPlaceholder: String,
      demoOutputTemplate: String,
    },
  },
  automationDetails: {
    icon: String,
    useCase: String,
    tools: { type: [String], default: [] },
    channels: { type: [String], default: [] },
    setupTime: String,
    flow: {
      steps: { type: [String], default: [] },
      demoPlaceholder: String,
      demoOutputTemplate: String,
      demoMode: { type: String, enum: ['text', 'file'] },
      demoFileLabel: String,
    },
  },
  agentDetails: {
    icon: String,
    useCase: String,
    capabilities: { type: [String], default: [] },
    channels: { type: [String], default: [] },
    tools: { type: [String], default: [] },
    setupTime: String,
    liveDemo: { type: String, enum: ['jevy-chat', 'synapse-chat', 'none'] },
  },
  // Sin `enum` de Mongoose a propósito: el vocabulario vive en Mongo (colección
  // JevyTaxonomy, dinámico, ver lib/jevy-taxonomy.ts), no se puede fijar acá en
  // tiempo de arranque del proceso. Validación real contra la lista vigente a
  // nivel de aplicación (admin form / seed scripts), no del schema.
  jevyProfile: {
    categoria: String,
    subtype: String,
    problemaCore: String,
    sector: String,
    pitchCorto: String,
  },
  translations: {
    en: localeContentFields(),
    fr: localeContentFields(),
    it: localeContentFields(),
  }
}, {
  timestamps: true
});

export default mongoose.models.Project as mongoose.Model<IProject> || mongoose.model<IProject>('Project', ProjectSchema);