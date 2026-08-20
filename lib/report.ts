import type { ILead, IAttachment, IAdditionalDetail } from '@/models/lead.model';
import type { IJobOffer } from '@/models/joboffer.model';

/**
 * Arma el markdown del informe de levantamiento (mismo contenido que el PDF de lib/pdf.ts).
 * Recibe: `Partial<ILead>` o `Partial<IJobOffer>` + datos de match (solo Lead).
 * Produce: `buildLeadMarkdown`/`buildJobOfferMarkdown` (string markdown) y los labels
 * `modalityLabel`/`contractTypeLabel` para traducir los enums de reclutador.
 */
// Arma el markdown completo del levantamiento — el mismo contenido que se
// convierte a PDF (lib/pdf.ts) y se manda por correo a Juan. Ver
// dev-aguila-azul/vault/portfolio: planes/levantamiento-informacion-jevy.

function field(label: string, value: string | undefined | null, fallback = '_sin dato_'): string {
  return `**${label}:** ${value && value.trim() ? value : fallback}`;
}

// Los enums de reclutador (schema/BD en inglés, ver dev-aguila-azul/vault/
// portfolio: planes/agente-intake-conversacional-deepseek) no son legibles
// para un humano — se traducen acá antes de mostrarse, tanto en el markdown
// como en el correo de n8n (ver lib/closing-actions.ts).
const MODALITY_LABELS: Record<string, string> = {
  remote: 'Remoto',
  onsite: 'Presencial',
  hybrid: 'Híbrido',
};
const CONTRACT_TYPE_LABELS: Record<string, string> = {
  freelance: 'Freelance',
  full_time: 'Tiempo completo',
  per_project: 'Por proyecto',
};

export function modalityLabel(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  return MODALITY_LABELS[value] || value;
}

export function contractTypeLabel(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  return CONTRACT_TYPE_LABELS[value] || value;
}

function attachmentsList(attachments: IAttachment[]): string {
  if (!attachments.length) return '_ninguno_';
  return attachments.map((a) => `- ${a.filename}${a.extractedNote ? ` — ${a.extractedNote}` : ''}`).join('\n');
}

// Sección de largo variable — lo que Jevy identificó como relevante en esta
// charla puntual, sin schema fijo (ver lib/closing.ts, additionalDetails).
// Se omite del todo si no hay nada, en vez de mostrar "_ninguno_": a
// diferencia de Adjuntos, no es un campo esperado siempre.
function additionalDetailsSection(details: IAdditionalDetail[]): string {
  if (!details.length) return '';
  const fields = details.map((d) => field(d.topic, d.detail)).join('\n');
  return `\n## Detalles adicionales\n${fields}\n`;
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
${additionalDetailsSection(lead.additionalDetails || [])}
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
${field('Modalidad', modalityLabel(offer.modality))}
${field('Tipo de contrato', contractTypeLabel(offer.contractType))}
${field('Pago ofrecido', offer.offeredAmount)}
${field('Proceso de selección', offer.selectionProcess)}
${additionalDetailsSection(offer.additionalDetails || [])}
## Adjuntos
${attachmentsList(offer.attachments || [])}
`;
}
