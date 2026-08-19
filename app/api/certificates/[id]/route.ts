import { createItemHandlers } from '@/lib/api/crud-handlers';
import Certificate from '@/models/certificate.model';

export const { GET, PATCH, DELETE } = createItemHandlers({
  Model: Certificate,
  entityErrorLabel: 'certificado',
  notFoundMessage: 'Certificado no encontrado',
  deletedMessage: 'Certificado eliminado correctamente',
});
