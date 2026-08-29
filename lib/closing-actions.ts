import path from 'path';
import Lead from '@/models/lead.model';
import JobOffer from '@/models/joboffer.model';
import SessionAttachment from '@/models/session-attachment.model';
import type { IAttachment, IAdditionalDetail } from '@/models/lead.model';
import { buildLeadMarkdown, buildJobOfferMarkdown, modalityLabel, contractTypeLabel } from '@/lib/report';
import { markdownToPdf } from '@/lib/pdf';
import { buildZip } from '@/lib/zip';
import { listSessionFiles, readLeadFile, saveLeadFile, leadFileUrl } from '@/lib/uploads';
import type { ClosingExtraction } from '@/lib/closing';
import type { MatchResult } from '@/lib/matching';

/**
 * Cierre real de la conversación con Jevy: guarda Lead/JobOffer en Mongo,
 * genera markdown+PDF(+ZIP de adjuntos) y arma el payload para el webhook de
 * n8n que agenda la cita (`action:'book'`).
 * Recibe: `{ extraction, transcript, sessionId, matchResult }` (`closeConversation`).
 * Procesa: colecciona adjuntos del disco, arma el reporte, guarda el documento en Mongo (Lead o JobOffer según el tipo).
 * Produce: `{ schedulingData: SchedulingData }`, listo para que el frontend lo mande al webhook al elegir horario.
 */
const EXT_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

async function collectAttachments(sessionId: string): Promise<IAttachment[]> {
  const filenames = await listSessionFiles(sessionId);
  // El markdown convertido vive en `SessionAttachment` (caché con TTL). Se copia
  // al Lead/JobOffer para que el registro sea autocontenido cuando el TTL borre
  // la caché.
  const converted = await SessionAttachment.find({ sessionId }).select('filename markdown').lean();
  const markdownByName = new Map(converted.map((c) => [c.filename, c.markdown]));
  return filenames.map((filename) => ({
    filename,
    type: EXT_TYPES[path.extname(filename).toLowerCase()] || 'application/octet-stream',
    url: leadFileUrl(sessionId, filename),
    ...(markdownByName.get(filename) ? { markdown: markdownByName.get(filename) } : {}),
  }));
}

/**
 * Campos que necesita `action:'book'` del webhook real de flujo-agenda-cita-
 * leads (contrato sacado de arquitectura/workflow-agenda.json en ese vault,
 * verificado 2026-08-13 — no es un webhook genérico de "avisar a Juan", es
 * específicamente el que crea el evento de Calendar). El frontend le agrega
 * `action:'book'` + `startISO`/`endISO` una vez que el lead elige un horario.
 */
export interface SchedulingData {
  name: string;
  email: string;
  type: 'client' | 'recruiter';
  preferredChannel: 'email' | 'whatsapp';
  channelContact: string;
  problem: string;
  whatTheyWant: string;
  estimatedAmount: string;
  expectedTimeline: string;
  projectMatch: string;
  interestLevel: 'high' | 'medium' | 'low';
  transcript: string;
  // Datos crudos de reclutador (solo type:'recruiter') — antes se aplastaban
  // dentro de problem/whatTheyWant para encajar en el contrato de cliente;
  // ahora van también como campos propios para que n8n arme una plantilla
  // real de reclutador en vez de reusar las etiquetas de cliente.
  companyName?: string;
  role?: string;
  techStack?: string;
  modality?: string;
  contractType?: string;
  selectionProcess?: string;
  // Informe generado (markdown/PDF, siempre; ZIP solo si hubo adjuntos) como
  // URL pública de R2 (antes iban en base64 dentro del payload — decisión
  // 2026-08-24, ver dev-aguila-azul/vault/portfolio: planes/admin-upload-
  // media-cloudflare-r2.md, Parte B). n8n (flujo-agenda-cita-leads) descarga
  // cada URL y adjunta el binario al correo a Juan — ajuste pendiente del
  // lado de n8n (2 nodos: el Code que arma los adjuntos y el IF que hoy mira
  // `attachmentsZipBase64`), lo hace el usuario manualmente cuando esto ya
  // esté probado.
  reportMarkdownUrl: string;
  reportPdfUrl: string;
  attachmentsZipUrl?: string;
  // Renderizado ya como HTML (mismo estilo "jevy> cat" del resto del correo
  // a Juan) — n8n solo lo inserta en un placeholder, no arma nada. Vacío si
  // Jevy no identificó ningún tema fuera de los campos fijos.
  additionalDetailsHtml: string;
}

function renderAdditionalDetailsHtml(details: IAdditionalDetail[]): string {
  if (!details.length) return '';
  const rows = details
    .map(
      (d) =>
        `<tr><td style="width:160px; color:#6E7781; vertical-align:top; padding:3px 0; font-size:13px;">${d.topic}</td><td style="color:#1F2328; vertical-align:top; padding:3px 0; font-size:13px;">${d.detail}</td></tr>`,
    )
    .join('');
  return `<p style="margin:0 0 10px; color:#2563EB; font-weight:600;">jevy&gt; cat detalles_adicionales.txt</p><table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="je-row" style="margin:0 0 22px;">${rows}</table>`;
}

function transcriptToText(transcript: { role: 'jevy' | 'lead'; text: string }[]): string {
  return transcript.map((m) => `${m.role === 'lead' ? 'Lead' : 'Jevy'}: ${m.text}`).join('\n');
}

// Sube un archivo generado (informe/zip) a R2 sin tumbar el cierre completo
// si R2 todavía no está configurado (PENDIENTE en .env) — el Lead/JobOffer
// en Mongo es lo crítico de guardar, la URL del reporte puede faltar sin
// que se pierda el contacto. `saveLeadFile` antes escribía a disco local y
// nunca fallaba por esto; con R2 sí puede fallar mientras el usuario no haya
// cargado las credenciales reales.
async function trySaveReportFile(sessionId: string, filename: string, buffer: Buffer): Promise<string> {
  try {
    return (await saveLeadFile(sessionId, filename, buffer)).url;
  } catch (error) {
    console.error(`Error subiendo ${filename} a R2 (¿credenciales R2 pendientes en .env?):`, error);
    return '';
  }
}

export async function closeConversation(params: {
  extraction: ClosingExtraction;
  transcript: { role: 'jevy' | 'lead'; text: string }[];
  sessionId: string;
  matchResult: MatchResult | null;
}): Promise<{ schedulingData: SchedulingData }> {
  const { extraction: c, transcript, sessionId, matchResult } = params;

  const attachments = await collectAttachments(sessionId);
  const isRecruiter = c.type === 'recruiter' && Boolean(c.companyName || c.role);
  const transcriptText = transcriptToText(transcript);

  if (isRecruiter) {
    const markdown = buildJobOfferMarkdown({
      name: c.name,
      email: c.email,
      channelContact: c.channelContact,
      companyName: c.companyName,
      role: c.role,
      techStack: c.techStack,
      modality: c.modality === 'no_definido' ? undefined : c.modality,
      contractType: c.contractType === 'no_definido' ? undefined : c.contractType,
      offeredAmount: c.offeredAmount,
      selectionProcess: c.selectionProcess,
      attachments,
      additionalDetails: c.additionalDetails,
    });
    const pdf = await markdownToPdf(markdown);
    let zip: Buffer | undefined;
    let attachmentsZipUrl: string | undefined;
    if (attachments.length) {
      zip = await buildZip(await Promise.all(attachments.map(async (a) => ({ filename: a.filename, buffer: await readLeadFile(sessionId, a.filename) }))));
      attachmentsZipUrl = await trySaveReportFile(sessionId, 'adjuntos.zip', zip);
    }
    const reportPdfUrl = await trySaveReportFile(sessionId, 'informe.pdf', pdf);
    const reportMarkdownUrl = await trySaveReportFile(sessionId, 'informe.md', Buffer.from(markdown, 'utf-8'));

    await JobOffer.create({
      name: c.name,
      email: c.email,
      preferredChannel: c.preferredChannel === 'no_definido' ? 'email' : c.preferredChannel,
      channelContact: c.channelContact,
      companyName: c.companyName || 'Sin especificar',
      role: c.role || 'Sin especificar',
      techStack: c.techStack || undefined,
      modality: c.modality === 'no_definido' ? undefined : c.modality,
      contractType: c.contractType === 'no_definido' ? undefined : c.contractType,
      offeredAmount: c.offeredAmount || undefined,
      selectionProcess: c.selectionProcess || undefined,
      markdownReport: markdown,
      attachments,
      additionalDetails: c.additionalDetails,
      interestLevel: c.interestLevel === 'no_definido' ? 'medium' : c.interestLevel,
      transcript,
      status: 'new',
    });

    return {
      schedulingData: {
        name: c.name,
        email: c.email,
        type: 'recruiter',
        preferredChannel: c.preferredChannel === 'no_definido' ? 'email' : c.preferredChannel,
        channelContact: c.channelContact,
        // Se mantienen aplastados como respaldo (por si n8n todavia no usa
        // los campos propios de abajo), pero la plantilla de reclutador real
        // usa companyName/role/techStack/etc. directo.
        problem: `${c.role || 'Vacante'} en ${c.companyName || 'empresa sin nombre'}`,
        whatTheyWant: c.techStack || 'N/D',
        estimatedAmount: c.offeredAmount || 'N/D',
        expectedTimeline: 'N/D',
        projectMatch: 'Ninguno',
        interestLevel: c.interestLevel === 'no_definido' ? 'medium' : c.interestLevel,
        transcript: transcriptText,
        companyName: c.companyName || 'Sin especificar',
        role: c.role || 'Sin especificar',
        techStack: c.techStack || 'N/D',
        modality: c.modality === 'no_definido' ? 'N/D' : modalityLabel(c.modality),
        contractType: c.contractType === 'no_definido' ? 'N/D' : contractTypeLabel(c.contractType),
        selectionProcess: c.selectionProcess || 'N/D',
        reportMarkdownUrl,
        reportPdfUrl,
        attachmentsZipUrl,
        additionalDetailsHtml: renderAdditionalDetailsHtml(c.additionalDetails),
      },
    };
  }

  const markdown = buildLeadMarkdown(
    {
      name: c.name,
      email: c.email,
      channelContact: c.channelContact,
      problem: c.problem,
      whatTheyWant: c.whatTheyWant,
      stakeholders: c.stakeholders,
      currentProcess: c.currentProcess,
      outOfScope: c.outOfScope,
      priorities: c.priorities,
      successCriteria: c.successCriteria,
      estimatedAmount: c.estimatedAmount,
      expectedTimeline: c.expectedTimeline,
      attachments,
      additionalDetails: c.additionalDetails,
    },
    matchResult?.project.title,
    matchResult?.tier,
  );
  const pdf = await markdownToPdf(markdown);
  let zip: Buffer | undefined;
  let attachmentsZipUrl: string | undefined;
  if (attachments.length) {
    zip = await buildZip(await Promise.all(attachments.map(async (a) => ({ filename: a.filename, buffer: await readLeadFile(sessionId, a.filename) }))));
    attachmentsZipUrl = await trySaveReportFile(sessionId, 'adjuntos.zip', zip);
  }
  const reportPdfUrl = await trySaveReportFile(sessionId, 'informe.pdf', pdf);
  const reportMarkdownUrl = await trySaveReportFile(sessionId, 'informe.md', Buffer.from(markdown, 'utf-8'));

  await Lead.create({
    name: c.name,
    email: c.email,
    preferredChannel: c.preferredChannel === 'no_definido' ? 'email' : c.preferredChannel,
    channelContact: c.channelContact,
    problem: c.problem || 'Sin especificar',
    whatTheyWant: c.whatTheyWant || 'Sin especificar',
    stakeholders: c.stakeholders || undefined,
    currentProcess: c.currentProcess || undefined,
    outOfScope: c.outOfScope || undefined,
    priorities: c.priorities || undefined,
    successCriteria: c.successCriteria || undefined,
    estimatedAmount: c.estimatedAmount || undefined,
    expectedTimeline: c.expectedTimeline || undefined,
    projectMatch: matchResult?.project._id,
    markdownReport: markdown,
    attachments,
    additionalDetails: c.additionalDetails,
    interestLevel: c.interestLevel === 'no_definido' ? 'medium' : c.interestLevel,
    transcript,
    status: 'new',
  });

  return {
    schedulingData: {
      name: c.name,
      email: c.email,
      type: 'client',
      preferredChannel: c.preferredChannel === 'no_definido' ? 'email' : c.preferredChannel,
      channelContact: c.channelContact,
      problem: c.problem || 'N/D',
      whatTheyWant: c.whatTheyWant || 'N/D',
      estimatedAmount: c.estimatedAmount || 'N/D',
      expectedTimeline: c.expectedTimeline || 'N/D',
      projectMatch: matchResult?.project.title || 'Ninguno',
      interestLevel: c.interestLevel === 'no_definido' ? 'medium' : c.interestLevel,
      transcript: transcriptText,
      reportMarkdownUrl,
      reportPdfUrl,
      attachmentsZipUrl,
      additionalDetailsHtml: renderAdditionalDetailsHtml(c.additionalDetails),
    },
  };
}
