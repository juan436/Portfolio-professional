import { createListHandlers } from '@/lib/api/crud-handlers';
import OtherSkill from '@/models/other-skills.model';

/** `/api/other-skills` — GET (lista) + POST (crear), vía `createListHandlers`. */
export const { GET, POST } = createListHandlers({
  Model: OtherSkill,
  entityLabelPlural: 'otras habilidades',
  entityLabelSingular: 'otra habilidad',
});
