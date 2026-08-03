import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/conection';
import ProjectStats from '@/models/project-stats.model';

// GET: Obtener las estadísticas de un proyecto o automatización puntual
export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const ref = searchParams.get('ref');

    if (!ref) {
      return NextResponse.json({
        success: false,
        message: 'Falta el parámetro ref'
      }, { status: 400 });
    }

    const stats = await ProjectStats.findOne({ 'link.ref': ref });

    return NextResponse.json({
      success: true,
      data: stats?.metrics || []
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return NextResponse.json({
      success: false,
      message: 'Error del servidor'
    }, { status: 500 });
  }
}

// POST: Crear o reemplazar las estadísticas de un proyecto/automatización (upsert por ref)
export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    const { link, metrics } = body;

    if (!link?.ref || !link?.type) {
      return NextResponse.json({
        success: false,
        message: 'Falta link.ref o link.type'
      }, { status: 400 });
    }

    const stats = await ProjectStats.findOneAndUpdate(
      { 'link.ref': link.ref },
      { link, metrics: metrics || [] },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      data: stats
    }, { status: 201 });
  } catch (error) {
    console.error('Error guardando estadísticas:', error);
    return NextResponse.json({
      success: false,
      message: 'Error del servidor'
    }, { status: 500 });
  }
}
