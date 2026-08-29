// upload-project-image.ts
// Sube una imagen local a R2 (misma convención que prepareImageUploadAction:
// sharp -> webp q82, máx 1920px, key projects/images/YYYY/MM/...) y la setea
// como `image` del proyecto con ese slug. Reemplazo temporal del uploader del
// Admin para cargar las fichas que faltan (sistema-auditoria, vamos-crm, etc.).
//
// Uso:
//   npx tsx --env-file=.env scripts/upload-project-image.ts <slug> <ruta-local> [--go]
//   (sin --go: dry-run, comprime y muestra key/URL pero no sube ni toca Mongo)

import { readFile } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import dbConnect from '../lib/db/conection'
import Project from '../models/project.model'
import { getR2Client, getR2BucketName, isR2Configured, publicUrlForKey } from '../lib/storage/r2'

function buildKey(filename: string): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const rand = Math.random().toString(36).slice(2, 10)
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `projects/images/${yyyy}/${mm}/${Date.now()}-${rand}-${safe}`
}

async function run() {
  const [slug, localPath] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
  const go = process.argv.includes('--go')
  if (!slug || !localPath) {
    console.error('Uso: upload-project-image.ts <slug> <ruta-local> [--go]')
    process.exit(1)
  }
  if (!isR2Configured()) {
    console.error('R2 no configurado en .env (R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET_NAME / R2_PUBLIC_URL)')
    process.exit(1)
  }

  const raw = await readFile(localPath)
  const webp = await sharp(raw)
    .rotate()
    .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer()

  const baseName = path.basename(localPath).replace(/\.[^/.]+$/, '')
  const key = buildKey(`${baseName}.webp`)
  const url = publicUrlForKey(key)
  const meta = await sharp(webp).metadata()

  console.log(`Original : ${(raw.length / 1024).toFixed(0)} KB`)
  console.log(`WebP     : ${(webp.length / 1024).toFixed(0)} KB  (${meta.width}x${meta.height})`)
  console.log(`Key      : ${key}`)
  console.log(`URL      : ${url}`)

  await dbConnect()
  const project = await Project.findOne({ slug }).select('_id slug title image')
  if (!project) {
    console.error(`\nNo hay proyecto con slug "${slug}"`)
    process.exit(1)
  }
  console.log(`Proyecto : ${project.title}  (image actual: ${project.get('image') || 'ninguna'})`)

  if (!go) {
    console.log('\nDry-run. Nada subido ni guardado. Corré con --go.')
    process.exit(0)
  }

  await getR2Client().send(
    new PutObjectCommand({ Bucket: getR2BucketName(), Key: key, Body: webp, ContentType: 'image/webp' }),
  )
  project.set('image', url)
  await project.save()
  console.log('\nSubido a R2 y guardado en el proyecto.')
  process.exit(0)
}

run().catch((e) => { console.error(e); process.exit(1) })
