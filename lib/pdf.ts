import PDFDocument from 'pdfkit';

// Convierte el markdown del levantamiento a PDF — mismo contenido, para leer
// (el markdown queda aparte, para que Juan lo siga trabajando). Liviano a
// propósito: pdfkit puro, sin Chromium (decisión 2026-08-13, ver dev-aguila-
// azul/vault/portfolio: planes/levantamiento-informacion-jevy).
//
// Parser de markdown deliberadamente simple — el formato de lib/report.ts es
// predecible (encabezados, líneas "**Label:** valor", bullets), no hace falta
// un parser general.

const LABEL_LINE = /^\*\*(.+?):\*\*\s*(.*)$/;

export async function markdownToPdf(markdown: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 56 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    for (const rawLine of markdown.split('\n')) {
      const line = rawLine.trimEnd();

      if (!line.trim()) {
        doc.moveDown(0.5);
        continue;
      }

      if (line.startsWith('# ')) {
        doc.moveDown(0.3).fontSize(20).font('Helvetica-Bold').text(line.slice(2));
        doc.moveDown(0.4);
        continue;
      }

      if (line.startsWith('## ')) {
        doc.moveDown(0.6).fontSize(15).font('Helvetica-Bold').text(line.slice(3));
        doc.moveDown(0.2);
        continue;
      }

      if (line.startsWith('### ')) {
        doc.moveDown(0.4).fontSize(12.5).font('Helvetica-Bold').text(line.slice(4));
        doc.moveDown(0.15);
        continue;
      }

      if (line.startsWith('- ')) {
        doc.fontSize(10.5).font('Helvetica').text(`•  ${line.slice(2)}`, { indent: 12 });
        continue;
      }

      const labelMatch = line.match(LABEL_LINE);
      if (labelMatch) {
        const [, label, value] = labelMatch;
        doc
          .fontSize(10.5)
          .font('Helvetica-Bold')
          .text(`${label}: `, { continued: true })
          .font('Helvetica')
          .text(value);
        continue;
      }

      doc.fontSize(10.5).font('Helvetica').text(line);
    }

    doc.end();
  });
}
