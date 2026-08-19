import { createListHandlers } from '@/lib/api/crud-handlers';
import Project from '@/models/project.model';

export const { GET, POST } = createListHandlers({
  Model: Project,
  sort: { createdAt: 1 },
  categoryFilter: true,
  entityLabelPlural: 'proyectos',
  entityLabelSingular: 'proyecto',
});
