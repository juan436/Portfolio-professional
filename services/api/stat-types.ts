import { API_URL } from './index';

export interface StatType {
  _id: string;
  key: string;
  label: string;
  prefix?: string;
  suffix?: string;
  gradient?: string;
}

/** Lista completa de tipos de estadística (sin filtrar) — usado por el form público de testimonios para mostrar prefix/suffix reales de cada métrica plantilla. */
export const fetchStatTypes = async (): Promise<StatType[]> => {
  try {
    const response = await fetch(`${API_URL}/stat-types`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching stat types:', error);
    return [];
  }
};

export interface StatTypeSummary {
  key: string;
  label: string;
  prefix: string;
  suffix: string;
  gradient?: string;
  total: number;
  count: number;
}

/**
 * Trae el total acumulado por tipo de estadística general (suma de todas las
 * métricas de todos los proyectos/automatizaciones que referencian ese tipo).
 * Solo devuelve tipos con al menos una métrica real cargada.
 */
export const fetchStatTypesSummary = async (): Promise<StatTypeSummary[]> => {
  try {
    const response = await fetch(`${API_URL}/stat-types/summary`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching stat types summary:', error);
    return [];
  }
};
