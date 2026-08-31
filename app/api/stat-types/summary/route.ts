import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/conection';
import StatType from '@/models/stat-type.model';
import ProjectStats from '@/models/project-stats.model';

/**
 * `/api/stat-types/summary` — GET, consumido por el home para las cifras acumuladas.
 * Recibe: nada.
 * Procesa: por cada `StatType`, suma la parte numérica de todas las métricas que lo referencian.
 * Produce: solo los tipos con al menos una métrica real (`count > 0`).
 */
function extractNumber(value: string): number | null {
  const cleaned = value.replace(/,/g, '');
  const match = cleaned.match(/-?\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : null;
}

export async function GET() {
  await dbConnect();

  try {
    const types = await StatType.find().lean();
    const allStats = await ProjectStats.find().lean();

    const summary = types.map((type) => {
      let total = 0;
      let count = 0;

      for (const stats of allStats) {
        for (const metric of stats.metrics as { label: string; value: string; statType?: string }[]) {
          if (metric.statType !== type.key) continue;
          const num = extractNumber(metric.value);
          if (num === null) continue;
          total += num;
          count++;
        }
      }

      return {
        key: type.key,
        label: type.label,
        prefix: type.prefix || '',
        suffix: type.suffix || '',
        gradient: type.gradient,
        total,
        count,
      };
    });

    return NextResponse.json({ success: true, data: summary.filter((s) => s.count > 0) });
  } catch (error) {
    console.error('Error calculando resumen de estadísticas:', error);
    return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 });
  }
}
