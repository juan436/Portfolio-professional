import { NextResponse } from 'next/server';
import { isRateLimited, getClientIp } from '@/lib/rate-limit';

const SCHEDULE_IP_LIMIT = 20;
const SCHEDULE_IP_WINDOW_MS = 10 * 60 * 1000;

/**
 * `/api/contact/schedule` — proxy server-side al webhook de n8n que agenda la cita.
 * Recibe: `{ action: 'availability' }` o `{ action: 'book', ...SchedulingData, startISO, endISO }`.
 * Procesa: rate-limit por IP, agrega el secreto `x-javy-secret` (nunca llega al navegador), reenvía tal cual.
 * Produce: la respuesta del webhook de n8n pasada directo (slots disponibles, o confirmación/409/500 del booking).
 */
// Proxy server-side al webhook real de n8n (flujo-agenda-cita-leads,
// "Jevy — Agenda"). El secreto (x-javy-secret) nunca llega al navegador.
// Contrato exacto sacado de arquitectura/workflow-agenda.json en ese vault:
//
// { action: 'availability' } -> { slots: [{ startISO, endISO, label }] }
// { action: 'book', name, email, type, preferredChannel, channelContact,
//   problem, whatTheyWant, estimatedAmount, expectedTimeline, projectMatch,
//   interestLevel, transcript, startISO, endISO }
//   -> 200 { success: true, eventId, meetLink }
//   -> 409 { success: false, error: 'slot_taken', message }
//   -> 500 { success: false, error: 'booking_failed', requestId, message }

export async function POST(request: Request) {
  if (isRateLimited(`schedule:${getClientIp(request)}`, SCHEDULE_IP_LIMIT, SCHEDULE_IP_WINDOW_MS)) {
    return NextResponse.json({ success: false, message: 'Demasiadas solicitudes, intenta de nuevo en unos minutos' }, { status: 429 });
  }

  const webhookUrl = process.env.JAVY_AGENDA_WEBHOOK_URL;
  const secret = process.env.JAVY_WEBHOOK_SECRET;

  if (!webhookUrl || webhookUrl === 'PENDIENTE') {
    return NextResponse.json(
      { success: false, message: 'El calendario todavía no está conectado' },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(secret && secret !== 'PENDIENTE' ? { 'x-javy-secret': secret } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({ success: false, message: 'Respuesta inválida del calendario' }));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error consultando el calendario (javy-agenda):', error);
    return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 });
  }
}
