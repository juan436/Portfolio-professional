import { createItemHandlers } from '@/lib/api/crud-handlers';
import Skill from '@/models/skill.model';

export const { GET, PATCH, DELETE } = createItemHandlers({
  Model: Skill,
  entityErrorLabel: 'habilidad',
  notFoundMessage: 'Habilidad no encontrada',
  deletedMessage: 'Habilidad eliminada correctamente',
  includeErrorDetail: true,
});
