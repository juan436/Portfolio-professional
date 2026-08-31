/**
 * Sube un archivo local a R2 (sharp -> webp, misma convención que
 * prepareImageUploadAction) bajo el prefijo de key que se indique, e imprime
 * la URL pública. NO toca Mongo — solo sube y devuelve la URL.
 *
 * Uso:
 *   npx tsx --env-file=.env scripts/upload-media-r2.ts <ruta-local> <key-prefix> [--go] [--max=N] [--q=N]
 *   (sin --go: dry-run — comprime y muestra key/URL, no sube)
 */
import { readFile } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getR2Client, getR2BucketName, isR2Configured, publicUrlForKey } from '../lib/storage/r2'

async function run() {
  const args = process.argv.slice(2)
  const [localPath, prefix] = args.filter((a) => !a.startsWith('--'))
  const go = args.includes('--go')
  const max = Number(args.find((a) => a.startsWith('--max='))?.split('=')[1] ?? 1600)
  const q = Number(args.find((a) => a.startsWith('--q='))?.split('=')[1] ?? 85)

  if (!localPath || !prefix) {
    console.error('Uso: upload-media-r2.ts <ruta-local> <key-prefix> [--go] [--max=N] [--q=N]')
    process.exit(1)
  }
  if (!isR2Configured()) {
    console.error('R2 no configurado en .env')
    process.exit(1)
  }

  const raw = await readFile(localPath)
  const webp = await sharp(raw)
    .rotate()
    .resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: q })
    .toBuffer()
  const meta = await sharp(webp).metadata()

  const base = path.basename(localPath).replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '_')
  const key = `${prefix.replace(/^\/|\/$/g, '')}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${base}.webp`
  const url = publicUrlForKey(key)

  console.log(`Original : ${(raw.length / 1024).toFixed(0)} KB`)
  console.log(`WebP     : ${(webp.length / 1024).toFixed(0)} KB  (${meta.width}x${meta.height})`)
  console.log(`Key      : ${key}`)
  console.log(`URL      : ${url}`)

  if (!go) {
    console.log('\nDry-run. Nada subido. Corré con --go.')
    return
  }
  await getR2Client().send(
    new PutObjectCommand({ Bucket: getR2BucketName(), Key: key, Body: webp, ContentType: 'image/webp' }),
  )
  console.log('\nSubido a R2.')
}

run().catch((e) => { console.error(e); process.exit(1) })
