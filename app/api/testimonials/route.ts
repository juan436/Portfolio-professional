import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/conection';
import Testimonial from '@/models/testimonial.model';

/**
 * `/api/testimonials` — GET (lista, filtrable por `type`/`ref`) + POST (crear).
 * Nota: el POST real de Admin ya vive en Server Actions (lib/actions/testimonials.ts).
 */
// GET: Obtener testimonios, filtrados opcionalmente por tipo y/o a qué proyecto/automatización están vinculados
export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const ref = searchParams.get('ref');

    const query: Record<string, unknown> = {};
    if (type) query.type = type;
    if (ref) query['links.ref'] = ref;

    const testimonials = await Testimonial.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: testimonials
    });
  } catch (error) {
    console.error('Error obteniendo testimonios:', error);
    return NextResponse.json({
      success: false,
      message: 'Error del servidor'
    }, { status: 500 });
  }
}

// POST: Crear un nuevo testimonio
export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();

    const testimonial = new Testimonial(body);
    await testimonial.save();

    return NextResponse.json({
      success: true,
      data: testimonial
    }, { status: 201 });
  } catch (error) {
    console.error('Error creando testimonio:', error);
    return NextResponse.json({
      success: false,
      message: 'Error del servidor'
    }, { status: 500 });
  }
}
