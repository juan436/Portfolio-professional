import { createListHandlers } from '@/lib/api/crud-handlers';
import OtherSkill from '@/models/other-skills.model';

export const { GET, POST } = createListHandlers({
  Model: OtherSkill,
  entityLabelPlural: 'otras habilidades',
  entityLabelSingular: 'otra habilidad',
});
