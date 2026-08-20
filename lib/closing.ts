import type { DeepSeekToolFunction } from '@/lib/deepseek';

/**
 * Extracción de cierre de la charla con Jevy (function calling de DeepSeek).
 * Recibe: nada directo — expone el schema de la tool y un normalizador de la respuesta cruda.
 * Produce: `buildClosingTool()` (schema DeepSeek), `normalizeClosing(raw)` (→ `ClosingExtraction`),
 * `isReadyToClose(c)` (mínimo indispensable para cerrar: nombre/email/contacto).
 */
// Extracción de cierre — todos los campos del levantamiento (cliente o
// reclutador) en una sola función. Se dispara más tarde que la extracción de
// matching (esa es rápida y liviana; esta es la foto completa antes de
// guardar). Ver dev-aguila-azul/vault/portfolio: planes/levantamiento-
// informacion-jevy.

export interface ClosingExtraction {
  type: 'client' | 'recruiter' | 'no_definido';
  name: string;
  email: string;
  channelContact: string;
  preferredChannel: 'email' | 'whatsapp' | 'no_definido';
  interestLevel: 'high' | 'medium' | 'low' | 'no_definido';

  // cliente
  problem: string;
  whatTheyWant: string;
  stakeholders: string;
  currentProcess: string;
  outOfScope: string;
  priorities: string;
  successCriteria: string;
  estimatedAmount: string;
  expectedTimeline: string;

  // reclutador
  companyName: string;
  role: string;
  techStack: string;
  modality: 'remote' | 'onsite' | 'hybrid' | 'no_definido';
  contractType: 'freelance' | 'full_time' | 'per_project' | 'no_definido';
  offeredAmount: string;
  selectionProcess: string;

  // Cualquier otro dato relevante que Jevy identifique en la charla, no
  // limitado a una lista fija — reemplaza tener que anticipar cada campo
  // posible con un schema cerrado. Ver dev-aguila-azul/vault/portfolio:
  // planes/levantamiento-informacion-jevy (registro 2026-08-15).
  additionalDetails: { topic: string; detail: string }[];
}

export function buildClosingTool(): DeepSeekToolFunction {
  return {
    name: 'extraer_cierre',
    description:
      'Extrae todo lo que el lead ya contó en la charla — datos de contacto y, según sea cliente o reclutador, las categorías correspondientes. Usa "no_definido" (o string vacío en campos de texto libre) para lo que todavía no se sabe. Nunca inventes.',
    parameters: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['client', 'recruiter', 'no_definido'], description: 'Si el lead es un cliente con un proyecto, o un reclutador con una oferta de trabajo' },
        name: { type: 'string', description: 'Nombre del lead' },
        email: { type: 'string', description: 'Correo del lead' },
        channelContact: { type: 'string', description: 'Número de WhatsApp del lead' },
        preferredChannel: { type: 'string', enum: ['email', 'whatsapp', 'no_definido'] },
        interestLevel: { type: 'string', enum: ['high', 'medium', 'low', 'no_definido'], description: 'Qué tan interesado/urgido se nota el lead' },

        problem: { type: 'string', description: '(cliente) Problema que quiere resolver' },
        whatTheyWant: { type: 'string', description: '(cliente) La solución/idea que tiene en mente' },
        stakeholders: { type: 'string', description: '(cliente) Quién lo usa, cuántos, qué roles' },
        currentProcess: { type: 'string', description: '(cliente) Cómo lo resuelven hoy' },
        outOfScope: { type: 'string', description: '(cliente) Qué NO incluye' },
        priorities: { type: 'string', description: '(cliente) Qué es imprescindible vs. deseable' },
        successCriteria: { type: 'string', description: '(cliente) Cómo sabría que funcionó' },
        estimatedAmount: { type: 'string', description: '(cliente) Presupuesto estimado' },
        expectedTimeline: { type: 'string', description: '(cliente) Tiempo esperado' },

        companyName: { type: 'string', description: '(reclutador) Empresa que ofrece' },
        role: { type: 'string', description: '(reclutador) Puesto y nivel de experiencia' },
        techStack: { type: 'string', description: '(reclutador) Stack técnico requerido' },
        modality: { type: 'string', enum: ['remote', 'onsite', 'hybrid', 'no_definido'] },
        contractType: { type: 'string', enum: ['freelance', 'full_time', 'per_project', 'no_definido'] },
        offeredAmount: { type: 'string', description: '(reclutador) Pago o rango ofrecido' },
        selectionProcess: { type: 'string', description: '(reclutador) Entrevistas, pruebas técnicas' },

        additionalDetails: {
          type: 'array',
          description:
            'Cualquier otro dato relevante para definir el proyecto/vacante que NO encaje en los campos de arriba — no es una lista cerrada, incluí lo que identifiques como importante en esta charla puntual, venga de una pregunta tuya o de algo que el lead mencionó sin que se lo preguntaras (charlando o en un adjunto). Ejemplos de temas a considerar si aplican (cliente): preferencia o restricción tecnológica (ej. "lo quiero en PHP"), integraciones necesarias con sistemas que ya usa, quién decide y aprueba el presupuesto, volumen esperado de uso, soporte post-entrega, plataformas objetivo (web/móvil/tablet), quién administra el contenido después, datos sensibles o compliance, urgencia real (por qué ahora), referencias visuales/funcionales, infraestructura existente (servidor/hosting/dominio), fecha límite dura vs. flexible, idiomas requeridos, identidad visual existente, estructura de pago, nivel de criticidad/uptime, equipo técnico interno, fases futuras ya pensadas, capacitación del equipo. Ejemplos (reclutador): estructura del equipo, duración y fecha de inicio, zona horaria, si es reemplazo o posición nueva, si el salario es negociable, beneficios adicionales, proceso completo hasta la decisión, contexto de la empresa (final/agencia/intermediario). No preguntes todo esto en cada charla — solo lo que sea relevante para ese lead puntual.',
          items: {
            type: 'object',
            properties: {
              topic: { type: 'string', description: 'Nombre corto del tema, ej. "Preferencia tecnológica"' },
              detail: { type: 'string', description: 'Lo que contó el lead sobre ese tema' },
            },
            required: ['topic', 'detail'],
          },
        },
      },
      required: ['type', 'name', 'email', 'channelContact'],
    },
  };
}

function pick(v: unknown): string {
  return typeof v === 'string' && v.trim() && v !== 'no_definido' ? v.trim() : '';
}

export function normalizeClosing(raw: Record<string, unknown> | null): ClosingExtraction {
  const str = (k: string) => (typeof raw?.[k] === 'string' ? (raw![k] as string) : '');
  return {
    type: (str('type') as ClosingExtraction['type']) || 'no_definido',
    name: pick(raw?.name),
    email: pick(raw?.email),
    channelContact: pick(raw?.channelContact),
    preferredChannel: (str('preferredChannel') as ClosingExtraction['preferredChannel']) || 'no_definido',
    interestLevel: (str('interestLevel') as ClosingExtraction['interestLevel']) || 'no_definido',

    problem: pick(raw?.problem),
    whatTheyWant: pick(raw?.whatTheyWant),
    stakeholders: pick(raw?.stakeholders),
    currentProcess: pick(raw?.currentProcess),
    outOfScope: pick(raw?.outOfScope),
    priorities: pick(raw?.priorities),
    successCriteria: pick(raw?.successCriteria),
    estimatedAmount: pick(raw?.estimatedAmount),
    expectedTimeline: pick(raw?.expectedTimeline),

    companyName: pick(raw?.companyName),
    role: pick(raw?.role),
    techStack: pick(raw?.techStack),
    modality: (str('modality') as ClosingExtraction['modality']) || 'no_definido',
    contractType: (str('contractType') as ClosingExtraction['contractType']) || 'no_definido',
    offeredAmount: pick(raw?.offeredAmount),
    selectionProcess: pick(raw?.selectionProcess),

    additionalDetails: pickAdditionalDetails(raw?.additionalDetails),
  };
}

function pickAdditionalDetails(v: unknown): { topic: string; detail: string }[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) => ({ topic: pick(item.topic), detail: pick(item.detail) }))
    .filter((item) => item.topic && item.detail);
}

/** Listo para cerrar: tenemos contacto completo — lo mínimo indispensable. */
export function isReadyToClose(c: ClosingExtraction): boolean {
  return Boolean(c.name && c.email && c.channelContact);
}
