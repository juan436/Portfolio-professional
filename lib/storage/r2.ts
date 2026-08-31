import { S3Client } from '@aws-sdk/client-s3';

/**
 * Cliente S3 apuntando a Cloudflare R2 (S3-compatible) — compartido por la
 * Parte A (media de proyectos, Admin) y la Parte B (adjuntos del chat de
 * Jevy). Ver dev-aguila-azul/vault/portfolio:
 * planes/admin-upload-media-cloudflare-r2.md.
 * Recibe: nada (lee `process.env` directo).
 * Produce: `getR2Client()` (singleton), `isR2Configured()`, `publicUrlForKey(key)`.
 */
const REQUIRED_VARS = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'R2_PUBLIC_URL'] as const;

export function isR2Configured(): boolean {
  return REQUIRED_VARS.every((key) => {
    const value = process.env[key];
    return Boolean(value) && value !== 'PENDIENTE';
  });
}

export function getR2BucketName(): string {
  return process.env.R2_BUCKET_NAME || '';
}

export function getR2PublicBaseUrl(): string {
  return (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');
}

export function publicUrlForKey(key: string): string {
  return `${getR2PublicBaseUrl()}/${key}`;
}

export function keyFromPublicUrl(url: string): string | undefined {
  const base = getR2PublicBaseUrl();
  if (!base || !url.startsWith(`${base}/`)) return undefined;
  return url.slice(base.length + 1);
}

let cachedClient: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!isR2Configured()) {
    throw new Error('R2 no configurado: faltan variables en .env (R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET_NAME / R2_PUBLIC_URL)');
  }
  if (cachedClient) return cachedClient;

  cachedClient = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
  return cachedClient;
}
