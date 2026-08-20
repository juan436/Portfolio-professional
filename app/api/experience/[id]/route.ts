import { createItemHandlers } from '@/lib/api/crud-handlers';
import Experience from '@/models/experience.model';

/** `/api/experience/[id]` — GET/PATCH/DELETE por id, vía `createItemHandlers`. */
export const { GET, PATCH, DELETE } = createItemHandlers({
  Model: Experience,
  entityErrorLabel: 'experiencia',
  notFoundMessage: 'Experiencia no encontrada',
  deletedMessage: 'Experiencia eliminada correctamente',
  updatedMessage: 'Experiencia actualizada correctamente',
  includeErrorDetail: true,
});
