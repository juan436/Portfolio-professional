import { createListHandlers } from '@/lib/api/crud-handlers';
import Skill from '@/models/skill.model';

/** `/api/skills` — GET (lista, filtrable por `?category`) + POST (crear), vía `createListHandlers`. */
export const { GET, POST } = createListHandlers({
  Model: Skill,
  sort: { name: 1 },
  categoryFilter: true,
  entityLabelPlural: 'habilidades',
  entityLabelSingular: 'habilidad',
});
