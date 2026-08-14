import type { ILead, IAttachment } from '@/models/lead.model';
import type { IJobOffer } from '@/models/joboffer.model';

// Arma el markdown completo del levantamiento — el mismo contenido que se
// convierte a PDF (lib/pdf.ts) y se manda por correo a Juan. Ver
// dev-aguila-azul/vault/portfolio: planes/levantamiento-informacion-jevy.

function field(label: string, value: string | undefined | null, fallback = '_sin dato_'): string {
  return `**${label}:** ${value && value.trim() ? value : fallback}`;
}

function attachmentsList(attachments: IAttachment[]): string {
  if (!attachments.length) return '_ninguno_';
  return attachments.map((a) => `- ${a.filename}${a.extractedNote ? ` — ${a.extractedNote}` : ''}`).join('\n');
}

export function buildLeadMarkdown(lead: Partial<ILead>, matchTitle?: string, matchTier?: 'entregado' | 'laboratorio'): string {
  const matchLine = matchTitle
    ? `**Match de catálogo:** ${matchTitle} (${matchTier === 'laboratorio' ? 'en desarrollo, Laboratorio' : 'entregado'})`
    : '**Match de catálogo:** sin parecido en el catálogo actual';

  return `# Levantamiento — ${lead.name || 'Lead sin nombre'}

## Contacto
${field('Nombre', lead.name)}
${field('Correo', lead.email)}
${field('WhatsApp', lead.channelContact)}

## Problema y necesidad
${field('Problema', lead.problem)}
${field('Qué tiene en mente', lead.whatTheyWant)}
${matchLine}

## Alcance
${field('Quién lo usa', lead.stakeholders)}
${field('Cómo lo resuelven hoy', lead.currentProcess)}
${field('Fuera de alcance', lead.outOfScope)}
${field('Prioridades', lead.priorities)}
${field('Criterio de éxito', lead.successCriteria)}

## Restricciones
${field('Presupuesto estimado', lead.estimatedAmount)}
${field('Tiempo esperado', lead.expectedTimeline)}

## Adjuntos
${attachmentsList(lead.attachments || [])}
`;
}

export function buildJobOfferMarkdown(offer: Partial<IJobOffer>): string {
  return `# Oferta de trabajo — ${offer.companyName || 'Empresa sin nombre'}

## Contacto
${field('Nombre', offer.name)}
${field('Correo', offer.email)}
${field('WhatsApp', offer.channelContact)}

## La vacante
${field('Empresa', offer.companyName)}
${field('Puesto', offer.role)}
${field('Stack requerido', offer.techStack)}
${field('Modalidad', offer.modality)}
${field('Tipo de contrato', offer.contractType)}
${field('Pago ofrecido', offer.offeredAmount)}
${field('Proceso de selección', offer.selectionProcess)}

## Adjuntos
${attachmentsList(offer.attachments || [])}
`;
}
