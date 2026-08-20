import { createItemHandlers } from '@/lib/api/crud-handlers';
import Certificate from '@/models/certificate.model';

/** `/api/certificates/[id]` — GET/PATCH/DELETE por id, vía `createItemHandlers`. */
export const { GET, PATCH, DELETE } = createItemHandlers({
  Model: Certificate,
  entityErrorLabel: 'certificado',
  notFoundMessage: 'Certificado no encontrado',
  deletedMessage: 'Certificado eliminado correctamente',
});
