import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/conection';
import Testimonial from '@/models/testimonial.model';
import { isRateLimited, getClientIp } from '@/lib/rate-limit';

/**
 * `/api/testimonials` — GET (lista pública, solo `status: 'approved'`, filtrable por `type`/`ref`)
 * + POST (form público de testimonios, sin sesión — protegido con rate-limit).
 * Nota: el CRUD de Admin (que sí puede crear en `approved` directo) vive en Server Actions
 * (lib/actions/testimonials.ts), no pasa por acá.
 */
const SUBMIT_IP_LIMIT = 3;
const SUBMIT_IP_WINDOW_MS = 15 * 60 * 1000;

interface TestimonialLinkInput {
  type: 'proyecto' | 'automatizacion';
  ref: string;
}

interface TestimonialSubmission {
  author: string;
  email: string;
  role?: string;
  content: string;
  rating?: number;
  links: TestimonialLinkInput[];
  suggestedMetrics?: { label: string; value: string; statType?: string }[];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET: Obtener testimonios aprobados, filtrados opcionalmente por tipo y/o a qué proyecto/automatización están vinculados
export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const ref = searchParams.get('ref');

    // Público: solo lo que Juan ya aprobó. La moderación pending vive en el Admin.
    const query: Record<string, unknown> = { status: 'approved' };
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

// POST: form público de testimonios. Recibe un solo testimonio "lógico" con
// 1-2 `links[]` (2 solo cuando el proyecto elegido tiene ficha hermana
// web+API y el cliente aceptó enviarlo también para esa) — se traduce en un
// documento `Testimonial` separado por cada link (el modelo real nunca tiene
// 2 refs en un mismo testimonio). Siempre nace `status: 'pending'`, sin
// importar lo que venga en el body.
export async function POST(request: Request) {
  if (isRateLimited(`testimonials:${getClientIp(request)}`, SUBMIT_IP_LIMIT, SUBMIT_IP_WINDOW_MS)) {
    return NextResponse.json({ success: false, message: 'Demasiadas solicitudes, intenta de nuevo en unos minutos' }, { status: 429 });
  }

  await dbConnect();

  try {
    const body = (await request.json()) as Partial<TestimonialSubmission>;

    const author = String(body.author || '').trim();
    const email = String(body.email || '').trim();
    const content = String(body.content || '').trim();
    const links = Array.isArray(body.links) ? body.links : [];

    if (!author) {
      return NextResponse.json({ success: false, message: 'Falta tu nombre' }, { status: 400 });
    }
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ success: false, message: 'Falta un correo válido' }, { status: 400 });
    }
    if (!content) {
      return NextResponse.json({ success: false, message: 'Falta el contenido del testimonio' }, { status: 400 });
    }
    if (links.length === 0 || links.length > 2) {
      return NextResponse.json({ success: false, message: 'Elegí a qué proyecto o automatización corresponde' }, { status: 400 });
    }
    if (links.some((l) => !l || !l.ref || (l.type !== 'proyecto' && l.type !== 'automatizacion'))) {
      return NextResponse.json({ success: false, message: 'Proyecto o automatización inválido' }, { status: 400 });
    }

    const rating = Number(body.rating) || 5;
    const suggestedMetrics = Array.isArray(body.suggestedMetrics)
      ? body.suggestedMetrics
          .filter((m) => m && String(m.value || '').trim())
          .map((m) => ({ label: String(m.label || '').trim(), value: String(m.value).trim(), statType: m.statType }))
      : [];

    // Ignora cualquier `status`/`type` que venga en el body — nunca se
    // confía en el cliente para eso. El form público siempre linkea a un
    // proyecto/automatización, así que el tipo real siempre es "resultado".
    const created = await Testimonial.create(
      links.map((link) => ({
        author,
        email,
        role: body.role ? String(body.role).trim() : undefined,
        content,
        type: 'resultado' as const,
        rating,
        links: [{ type: link.type, ref: link.ref }],
        status: 'pending' as const,
        suggestedMetrics,
      }))
    );

    return NextResponse.json({
      success: true,
      data: created
    }, { status: 201 });
  } catch (error) {
    console.error('Error creando testimonio:', error);
    return NextResponse.json({
      success: false,
      message: 'Error del servidor'
    }, { status: 500 });
  }
}
