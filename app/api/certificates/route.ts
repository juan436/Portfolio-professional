import { createListHandlers } from '@/lib/api/crud-handlers';
import Certificate from '@/models/certificate.model';

export const { GET, POST } = createListHandlers({
  Model: Certificate,
  sort: { date: -1 },
  entityLabelPlural: 'certificados',
  entityLabelSingular: 'certificado',
});
