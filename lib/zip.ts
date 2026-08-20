import * as archiver from 'archiver';

/**
 * Arma un ZIP en memoria a partir de archivos ya leídos.
 * @param files - Lista de `{ filename, buffer }` a incluir.
 * @returns `Buffer` con el ZIP completo (nivel de compresión 9).
 */
export async function buildZip(files: { filename: string; buffer: Buffer }[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const archive = new archiver.ZipArchive({ zlib: { level: 9 } });
    const chunks: Buffer[] = [];

    archive.on('data', (chunk: Buffer) => chunks.push(chunk));
    archive.on('end', () => resolve(Buffer.concat(chunks)));
    archive.on('error', reject);

    for (const f of files) {
      archive.append(f.buffer, { name: f.filename });
    }

    archive.finalize();
  });
}
