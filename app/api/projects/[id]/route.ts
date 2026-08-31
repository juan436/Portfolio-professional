import { createItemHandlers } from '@/lib/api/crud-handlers';
import Project from '@/models/project.model';

export const { GET, PATCH, DELETE } = createItemHandlers({
  Model: Project,
  entityErrorLabel: 'proyecto',
  notFoundMessage: 'Proyecto no encontrado',
  deletedMessage: 'Proyecto eliminado correctamente',
  includeErrorDetail: true,
});
