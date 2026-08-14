import { NextResponse } from 'next/server';

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
