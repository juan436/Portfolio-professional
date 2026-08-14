import path from 'path';
import Lead from '@/models/lead.model';
import JobOffer from '@/models/joboffer.model';
import type { IAttachment } from '@/models/lead.model';
import { buildLeadMarkdown, buildJobOfferMarkdown } from '@/lib/report';
import { markdownToPdf } from '@/lib/pdf';
import { buildZip } from '@/lib/zip';
import { listSessionFiles, readLeadFile, saveLeadFile } from '@/lib/uploads';
import type { ClosingExtraction } from '@/lib/closing';
import type { MatchResult } from '@/lib/matching';

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
  return filenames.map((filename) => ({
    filename,
    type: EXT_TYPES[path.extname(filename).toLowerCase()] || 'application/octet-stream',
    url: `/api/uploads/leads/${sessionId}/${filename}`,
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
}

function transcriptToText(transcript: { role: 'jevy' | 'lead'; text: string }[]): string {
  return transcript.map((m) => `${m.role === 'lead' ? 'Lead' : 'Jevy'}: ${m.text}`).join('\n');
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
    });
    const pdf = await markdownToPdf(markdown);
    if (attachments.length) {
      const zip = await buildZip(await Promise.all(attachments.map(async (a) => ({ filename: a.filename, buffer: await readLeadFile(sessionId, a.filename) }))));
      await saveLeadFile(sessionId, 'adjuntos.zip', zip);
    }
    await saveLeadFile(sessionId, 'informe.pdf', pdf);
    await saveLeadFile(sessionId, 'informe.md', Buffer.from(markdown, 'utf-8'));

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
      interestLevel: c.interestLevel === 'no_definido' ? 'medium' : c.interestLevel,
      transcript,
      status: 'new',
    });

    // El contrato real de `book` está pensado para cliente (problem/
    // whatTheyWant/projectMatch) — Content: Jevy todavía no tiene copy propio
    // para reclutador (solo el lookup de `typeLabels`, sin plantilla de email
    // distinta). Mapeo lo mejor posible mientras tanto, no perfecto — pendiente
    // real del lado de flujo-agenda-cita-leads, no de acá.
    return {
      schedulingData: {
        name: c.name,
        email: c.email,
        type: 'recruiter',
        preferredChannel: c.preferredChannel === 'no_definido' ? 'email' : c.preferredChannel,
        channelContact: c.channelContact,
        problem: `${c.role || 'Vacante'} en ${c.companyName || 'empresa sin nombre'}`,
        whatTheyWant: c.techStack || 'N/D',
        estimatedAmount: c.offeredAmount || 'N/D',
        expectedTimeline: 'N/D',
        projectMatch: 'Ninguno',
        interestLevel: c.interestLevel === 'no_definido' ? 'medium' : c.interestLevel,
        transcript: transcriptText,
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
    },
    matchResult?.project.title,
    matchResult?.tier,
  );
  const pdf = await markdownToPdf(markdown);
  if (attachments.length) {
    const zip = await buildZip(await Promise.all(attachments.map(async (a) => ({ filename: a.filename, buffer: await readLeadFile(sessionId, a.filename) }))));
    await saveLeadFile(sessionId, 'adjuntos.zip', zip);
  }
  await saveLeadFile(sessionId, 'informe.pdf', pdf);
  await saveLeadFile(sessionId, 'informe.md', Buffer.from(markdown, 'utf-8'));

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
    },
  };
}
