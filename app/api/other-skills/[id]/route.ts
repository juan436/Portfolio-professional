import { createItemHandlers } from '@/lib/api/crud-handlers';
import OtherSkill from '@/models/other-skills.model';

export const { PATCH, DELETE } = createItemHandlers({
  Model: OtherSkill,
  entityErrorLabel: 'otra habilidad',
  notFoundMessage: 'Habilidad no encontrada',
  deletedMessage: 'Habilidad eliminada correctamente',
  updateStrategy: 'findByIdAndUpdate',
});
