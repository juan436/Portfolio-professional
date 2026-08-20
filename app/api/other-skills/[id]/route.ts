import { createItemHandlers } from '@/lib/api/crud-handlers';
import OtherSkill from '@/models/other-skills.model';

/** `/api/other-skills/[id]` — PATCH/DELETE por id, vía `createItemHandlers`. */
// Nunca tuvo GET-por-id — solo se reexporta PATCH/DELETE
export const { PATCH, DELETE } = createItemHandlers({
  Model: OtherSkill,
  entityErrorLabel: 'otra habilidad',
  notFoundMessage: 'Habilidad no encontrada',
  deletedMessage: 'Habilidad eliminada correctamente',
  updateStrategy: 'findByIdAndUpdate',
});
