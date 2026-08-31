import type { IProject } from '@/models/project.model';
import type { DeepSeekToolFunction } from '@/lib/deepseek';
import type { IJevyTaxonomyEntry } from '@/models/jevy-taxonomy.model';

/**
 * Motor de matching determinístico de Jevy (lead ↔ catálogo de proyectos).
 * Recibe: `LeadProfile` extraído de la charla (categoria/subtype/problemaCore/sector) + catálogo `IProject[]`.
 * Procesa: puntúa por eje contra `jevyProfile` de cada proyecto (problema_core obligatorio),
 * pasada 1 sobre catálogo entregado, pasada 2 sobre Laboratorio si la 1 no encuentra nada.
 * Produce: `findBestMatch` → mejor candidato o `null`; `buildExtractionTool` → schema DeepSeek;
 * `normalizeLeadProfile`/`countNoDefinido` para la extracción cruda.
 */

export interface LeadProfile {
  categoria: string;
  subtype: string;
  problema_core: string;
  sector: string;
}

export interface MatchResult {
  project: IProject;
  tier: 'entregado' | 'laboratorio';
  score: number;
}

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
  if (!axisMatches(lead.problema_core, profile.problemaCore)) return 0;

  let score = WEIGHTS.problema_core;
  if (includeCategoria && axisMatches(lead.categoria, profile.categoria)) score += WEIGHTS.categoria;
  if (axisMatches(lead.subtype, profile.subtype)) score += WEIGHTS.subtype;
  if (axisMatches(lead.sector, profile.sector)) score += WEIGHTS.sector;
  return score;
}

function bestAbove(candidates: { project: IProject; score: number }[], floor: number) {
  const passing = candidates.filter((c) => c.score >= floor).sort((a, b) => b.score - a.score);
  if (passing.length === 0) return null;

  const topScore = passing[0].score;
  const tiedAtTop = passing.filter((c) => c.score === topScore);
  if (tiedAtTop.length > 1) return null;

  return passing[0];
}

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

export function countNoDefinido(profile: LeadProfile): number {
  return Object.values(profile).filter((v) => v === 'no_definido').length;
}
