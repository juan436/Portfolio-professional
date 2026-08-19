import { createListHandlers } from '@/lib/api/crud-handlers';
import Experience from '@/models/experience.model';

export const { GET, POST } = createListHandlers({
  Model: Experience,
  sort: { createdAt: -1 },
  entityLabelPlural: 'experiencias',
  entityLabelSingular: 'experiencia',
  validateCreate: (body) => {
    if (!body.position || !body.company || !body.period) {
      return 'Faltan datos requeridos (position, company, period)';
    }
    return null;
  },
  createSuccessMessage: 'Experiencia creada correctamente',
});
