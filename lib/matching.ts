import type { IProject } from '@/models/project.model';
import type { DeepSeekToolFunction } from '@/lib/deepseek';
import type { IJevyTaxonomyEntry } from '@/models/jevy-taxonomy.model';

// Motor de matching determinístico — reemplaza el criterio libre del LLM.
// Jevy no decide si hay parecido: este código lo calcula, Jevy solo narra
// el resultado. Ver dev-aguila-azul/vault/portfolio: planes/matching-catalogo-function-calling.

export interface LeadProfile {
  categoria: string; // 'no_definido' permitido — nunca es 'laboratorio', un lead no lo pide
  subtype: string;
  problema_core: string;
  sector: string;
}

export interface MatchResult {
  project: IProject;
  tier: 'entregado' | 'laboratorio';
  score: number;
}

// Pesos tentativos (charla 2026-08-12) — punto de partida, se ajustan con
// pruebas reales una vez conectado, mismo método que el ajuste del prompt
// de catálogo del 2026-08-11. `categoria` solo suma en la pasada 1 (entregado):
// en la pasada 2 (Laboratorio) no aplica, un lead nunca pide esa categoría.
const WEIGHTS = {
  categoria: 20,
  subtype: 35,
  problema_core: 35,
  sector: 10,
};

const MATCH_FLOOR = 50;

function axisMatches(leadValue: string | undefined, catalogValue: string | undefined): boolean {
  if (!leadValue || leadValue === 'no_definido') return false;
  if (!catalogValue || catalogValue === 'no_definido') return false;
  return leadValue === catalogValue;
}

function scoreCandidate(lead: LeadProfile, project: IProject, includeCategoria: boolean): number {
  const profile = project.jevyProfile;
  if (!profile) return 0;

  let score = 0;
  if (includeCategoria && axisMatches(lead.categoria, profile.categoria)) score += WEIGHTS.categoria;
  if (axisMatches(lead.subtype, profile.subtype)) score += WEIGHTS.subtype;
  if (axisMatches(lead.problema_core, profile.problema_core)) score += WEIGHTS.problema_core;
  if (axisMatches(lead.sector, profile.sector)) score += WEIGHTS.sector;
  return score;
}

/**
 * Empate en el score más alto entre 2+ candidatos = ambiguo. No es adivinable
 * de forma confiable cuál mostrar, así que no se muestra ninguno — mismo
 * criterio que "sin match": silencio es mejor que un parecido forzado, y un
 * empate resuelto por orden de query no es una decisión, es azar.
 */
function bestAbove(candidates: { project: IProject; score: number }[], floor: number) {
  const passing = candidates.filter((c) => c.score >= floor).sort((a, b) => b.score - a.score);
  if (passing.length === 0) return null;

  const topScore = passing[0].score;
  const tiedAtTop = passing.filter((c) => c.score === topScore);
  if (tiedAtTop.length > 1) return null;

  return passing[0];
}

/**
 * Pasada 1: catálogo entregado (categoria del proyecto === categoria del lead,
 * nunca 'laboratorio'). Pasada 2, solo si la 1 no encontró nada por encima del
 * piso: catálogo en Laboratorio (categoria no se compara, es un estado, no un
 * eje pedible por el lead).
 */
export function findBestMatch(lead: LeadProfile, catalog: IProject[]): MatchResult | null {
  const entregadoPool = catalog.filter(
    (p) => p.jevyProfile?.categoria && p.jevyProfile.categoria !== 'laboratorio' && p.jevyProfile.categoria === lead.categoria,
  );
  const entregadoScored = entregadoPool.map((project) => ({ project, score: scoreCandidate(lead, project, true) }));
  const entregadoBest = bestAbove(entregadoScored, MATCH_FLOOR);
  if (entregadoBest) {
    return { project: entregadoBest.project, tier: 'entregado', score: entregadoBest.score };
  }

  const laboratorioPool = catalog.filter((p) => p.jevyProfile?.categoria === 'laboratorio');
  const laboratorioScored = laboratorioPool.map((project) => ({ project, score: scoreCandidate(lead, project, false) }));
  const laboratorioBest = bestAbove(laboratorioScored, MATCH_FLOOR);
  if (laboratorioBest) {
    return { project: laboratorioBest.project, tier: 'laboratorio', score: laboratorioBest.score };
  }

  return null;
}

interface Taxonomy {
  categorias: IJevyTaxonomyEntry[];
  subtypes: IJevyTaxonomyEntry[];
  problemasCore: IJevyTaxonomyEntry[];
  sectores: IJevyTaxonomyEntry[];
}

function enumProperty(entries: IJevyTaxonomyEntry[], excludeValues: string[] = []) {
  const filtered = entries.filter((e) => !excludeValues.includes(e.value));
  return {
    type: 'string',
    enum: filtered.map((e) => e.value),
    description: filtered.map((e) => `${e.value}: ${e.definicion}`).join(' | '),
  };
}

/**
 * Arma la función de function calling a partir del vocabulario vigente (Mongo,
 * dinámico) — mismo enum que usa el catálogo, ver dev-aguila-azul/vault/portfolio:
 * planes/matching-catalogo-function-calling. `categoria` excluye 'laboratorio':
 * es un estado del catálogo, ningún lead lo pide.
 */
export function buildExtractionTool(taxonomy: Taxonomy): DeepSeekToolFunction {
  return {
    name: 'extraer_perfil_lead',
    description:
      'Clasifica lo que el lead ya contó en la charla, en base a la conversación hasta ahora. Si un eje no tiene suficiente información todavía, usa "no_definido" — nunca fuerces una clasificación insegura.',
    parameters: {
      type: 'object',
      properties: {
        categoria: enumProperty(taxonomy.categorias, ['laboratorio']),
        subtype: enumProperty(taxonomy.subtypes),
        problema_core: enumProperty(taxonomy.problemasCore),
        sector: enumProperty(taxonomy.sectores),
      },
      required: ['categoria', 'subtype', 'problema_core', 'sector'],
    },
  };
}

export function normalizeLeadProfile(raw: Record<string, unknown> | null): LeadProfile {
  const pick = (v: unknown) => (typeof v === 'string' && v.trim() ? v : 'no_definido');
  return {
    categoria: pick(raw?.categoria),
    subtype: pick(raw?.subtype),
    problema_core: pick(raw?.problema_core),
    sector: pick(raw?.sector),
  };
}

/**
 * Cuenta ejes en 'no_definido'. Incluso con temperature 0, DeepSeek (modelo
 * MoE) puede devolver una clasificación "confundida" por el ruteo de expertos
 * en el servidor — no es 100% determinístico pese a temperature 0 (probado:
 * 1/15 corridas idénticas). 3+ ejes sin definir en la misma charla que antes
 * sí los clasificó es señal de esa confusión puntual, no de falta real de
 * información — vale la pena un reintento antes de darse por vencido.
 */
export function countNoDefinido(profile: LeadProfile): number {
  return Object.values(profile).filter((v) => v === 'no_definido').length;
}
