import { renderToBuffer } from '@json-render/react-pdf';
import { validateSpec } from '@json-render/core';
import type { Spec } from '@json-render/core';

/**
 * Convierte el markdown del informe de levantamiento (lib/report.ts) a PDF.
 * Recibe: markdown con el formato fijo de report.ts (encabezados, "**Label:** valor", bullets).
 * Procesa: parsea el markdown a secciones, arma un `Spec` de @json-render y lo valida.
 * Produce: `Buffer` del PDF renderizado.
 */

const LABEL_LINE = /^\*\*(.+?):\*\*\s*(.*)$/;
const ITALIC_LINE = /^_(.+)_$/;
const NARRATIVE_THRESHOLD = 60;

const BLUE = '#2563EB';
const BLUE_DARK = '#1e40af';
const BLUE_SOFT_BG = '#EFF6FF';
const TEXT_DARK = '#1B2430';
const TEXT_MUTED = '#5B6472';
const BORDER_SOFT = '#E2E5EA';

type Elements = Record<string, { type: string; props: Record<string, unknown>; children?: string[] }>;

class SpecBuilder {
  elements: Elements = {};
  private counter = 0;

  add(type: string, props: Record<string, unknown>, children: string[] = []): string {
    const id = `e${this.counter++}`;
    this.elements[id] = { type, props, children };
    return id;
  }
}

interface ParsedField {
  label: string;
  value: string;
}

interface ParsedSection {
  title: string;
  fields: ParsedField[];
  matchValue?: string;
  bullets?: string[];
  emptyNote?: string;
}

function parseMarkdown(markdown: string): { kicker: string; subject: string; sections: ParsedSection[] } {
  const lines = markdown.split('\n');

  const titleLine = lines[0]?.startsWith('# ') ? lines[0].slice(2) : 'Informe';
  const [kicker, ...rest] = titleLine.includes(' — ') ? titleLine.split(' — ') : ['Informe', titleLine];
  const subject = rest.join(' — ') || 'Sin nombre';

  const sections: ParsedSection[] = [];
  let current: ParsedSection | null = null;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trimEnd();
    if (!line.trim()) continue;

    if (line.startsWith('## ')) {
      current = { title: line.slice(3), fields: [] };
      sections.push(current);
      continue;
    }
    if (!current) continue;

    if (line.startsWith('- ')) {
      current.bullets = current.bullets || [];
      current.bullets.push(line.slice(2));
      continue;
    }

    const italicMatch = line.match(ITALIC_LINE);
    if (italicMatch) {
      current.emptyNote = italicMatch[1];
      continue;
    }

    const labelMatch = line.match(LABEL_LINE);
    if (labelMatch) {
      const [, label, value] = labelMatch;
      if (label === 'Match de catálogo') {
        current.matchValue = value;
      } else {
        current.fields.push({ label, value });
      }
    }
  }

  return { kicker, subject, sections };
}

function buildSpec(markdown: string): Spec {
  const { kicker, subject, sections } = parseMarkdown(markdown);
  const b = new SpecBuilder();

  const kickerText = b.add('Text', { text: 'JEVY — ASISTENTE DEL ING. JUAN VILLEGAS', fontSize: 9, color: '#DCE8FF' });
  const subjectHeading = b.add('Heading', { text: subject, level: 'h1', color: '#FFFFFF' });
  const dateText = b.add('Text', {
    text: `${kicker} — ${new Date().toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    fontSize: 10,
    color: '#DCE8FF',
  });
  const header = b.add(
    'View',
    { backgroundColor: BLUE_DARK, paddingTop: 28, paddingBottom: 24, paddingLeft: 40, paddingRight: 40 },
    [kickerText, subjectHeading, dateText],
  );

  const sectionIds: string[] = [];
  for (const section of sections) {
    sectionIds.push(...buildSection(b, section));
  }

  const footer = b.add('PageNumber', { format: 'Página {pageNumber} de {totalPages}', fontSize: 8, color: TEXT_MUTED, align: 'right' });
  const generatedBy = b.add('Text', { text: 'Generado automáticamente por Jevy — jevy.dev', fontSize: 8, color: TEXT_MUTED });
  const footerDivider = b.add('Divider', { color: BORDER_SOFT, thickness: 0.5, marginTop: 4, marginBottom: 6 });
  const footerRow = b.add('Row', { justifyContent: 'space-between', alignItems: 'center' }, [generatedBy, footer]);
  const footerBlock = b.add('View', { paddingLeft: 40, paddingRight: 40, paddingBottom: 20 }, [footerDivider, footerRow]);

  const body = b.add('Column', { gap: 18, padding: 40 }, sectionIds);
  const page = b.add('Page', { size: 'LETTER' }, [header, body, footerBlock]);
  const doc = b.add('Document', { title: `Informe — ${subject}` }, [page]);

  return { root: doc, elements: b.elements };
}

function buildSection(b: SpecBuilder, section: ParsedSection): string[] {
  const blockIds: string[] = [];

  const heading = b.add('Heading', { text: section.title, level: 'h2', color: TEXT_DARK });
  const divider = b.add('Divider', { color: BLUE, thickness: 1.5, marginBottom: 10 });
  blockIds.push(b.add('View', {}, [heading, divider]));

  let tableRows: string[][] = [];

  const flushTable = () => {
    if (tableRows.length === 0) return;
    blockIds.push(
      b.add('Table', {
        columns: [
          { header: 'Campo', width: '32%' },
          { header: 'Detalle', width: '68%' },
        ],
        rows: tableRows,
        striped: true,
        borderColor: BORDER_SOFT,
        headerBackgroundColor: '#F6F8FA',
        headerTextColor: TEXT_MUTED,
        fontSize: 10,
      }),
    );
    tableRows = [];
  };

  const values = section.fields.map((f) => f.value.trim() || '_sin dato_');
  const sectionIsNarrative = values.some((v) => v.length > NARRATIVE_THRESHOLD);

  if (sectionIsNarrative) {
    for (let i = 0; i < section.fields.length; i++) {
      const label = b.add('Text', { text: section.fields[i].label.toUpperCase(), fontSize: 9, color: TEXT_MUTED, fontWeight: 'bold' });
      const body = b.add('Text', { text: values[i], fontSize: 11, color: TEXT_DARK, lineHeight: 1.5 });
      blockIds.push(b.add('Column', { gap: 4 }, [label, body]));
    }
  } else {
    for (let i = 0; i < section.fields.length; i++) {
      tableRows.push([section.fields[i].label, values[i]]);
    }
    flushTable();
  }

  if (section.matchValue) {
    const label = b.add('Text', { text: 'MATCH DE CATÁLOGO', fontSize: 9, color: BLUE_DARK, fontWeight: 'bold' });
    const value = b.add('Heading', { text: section.matchValue, level: 'h4', color: TEXT_DARK });
    blockIds.push(
      b.add(
        'View',
        { backgroundColor: BLUE_SOFT_BG, borderWidth: 1, borderColor: BORDER_SOFT, borderRadius: 6, padding: 14 },
        [label, value],
      ),
    );
  }

  if (section.bullets?.length) {
    blockIds.push(
      b.add(
        'View',
        { backgroundColor: '#F6F8FA', borderRadius: 6, padding: 14 },
        [b.add('List', { items: section.bullets, fontSize: 10.5, color: TEXT_DARK, spacing: 6 })],
      ),
    );
  }

  if (section.emptyNote) {
    blockIds.push(b.add('Text', { text: section.emptyNote, fontSize: 10, color: TEXT_MUTED, fontStyle: 'italic' }));
  }

  return [b.add('Column', { gap: 10 }, blockIds)];
}

export async function markdownToPdf(markdown: string): Promise<Buffer> {
  const spec = buildSpec(markdown);

  const validation = validateSpec(spec);
  if (validation.issues.some((i) => i.severity === 'error')) {
    throw new Error('Spec de PDF inválido: ' + JSON.stringify(validation.issues));
  }

  const bytes = await renderToBuffer(spec);
  return Buffer.from(bytes);
}
