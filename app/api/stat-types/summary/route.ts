import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/conection';
import StatType from '@/models/stat-type.model';
import ProjectStats from '@/models/project-stats.model';

// Saca la parte numérica de un valor libre ("24h", "-40%", "1,200+") para poder sumarlo.
function extractNumber(value: string): number | null {
  const cleaned = value.replace(/,/g, '');
  const match = cleaned.match(/-?\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : null;
}

// GET: Para cada tipo de estadística base, suma todas las métricas de todos los
// proyectos/automatizaciones que la referencian. Solo devuelve tipos con al
// menos una métrica real cargada — el home decide qué hacer si un tipo no tiene nada.
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
