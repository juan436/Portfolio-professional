// upload-project-gallery.ts
// Sube TODAS las imágenes de una carpeta local a R2 (sharp -> webp q82, máx
// 1920px) y las setea como galería del proyecto: la primera va a `image`
// (hero), el resto a `images[]`. Orden por prefijo numérico del nombre
// (1-, 2-, ... 10-, 11-), no alfabético.
//
// Uso:
//   npx tsx --env-file=.env scripts/upload-project-gallery.ts <slug> <carpeta> [--go]
//   (sin --go: dry-run, comprime y muestra el plan pero no sube ni toca Mongo)

import { readdir, readFile } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import dbConnect from '../lib/db/conection'
import Project from '../models/project.model'
import { getR2Client, getR2BucketName, isR2Configured, publicUrlForKey } from '../lib/storage/r2'

const IMG_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif'])

function numericPrefix(name: string): number {
  const m = name.match(/^(\d+)/)
  return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER
}

function buildKey(filename: string): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const rand = Math.random().toString(36).slice(2, 10)
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `projects/images/${yyyy}/${mm}/${Date.now()}-${rand}-${safe}`
}

async function run() {
  const [slug, dir] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
  const go = process.argv.includes('--go')
  if (!slug || !dir) {
    console.error('Uso: upload-project-gallery.ts <slug> <carpeta> [--go]')
    process.exit(1)
  }
  if (!isR2Configured()) {
    console.error('R2 no configurado en .env')
    process.exit(1)
  }

  const files = (await readdir(dir))
    .filter((f) => IMG_EXT.has(path.extname(f).toLowerCase()))
    .sort((a, b) => numericPrefix(a) - numericPrefix(b))

  if (files.length === 0) {
    console.error('No hay imágenes en la carpeta')
    process.exit(1)
  }

  await dbConnect()
  const project = await Project.findOne({ slug }).select('_id slug title image images')
  if (!project) {
    console.error(`No hay proyecto con slug "${slug}"`)
    process.exit(1)
  }
  console.log(`Proyecto: ${project.title}`)
  console.log(`image actual: ${project.get('image') || 'ninguna'}  |  images actuales: ${(project.get('images') || []).length}`)
  console.log(`\nOrden a subir (${files.length}):`)
  files.forEach((f, i) => console.log(`  ${i === 0 ? '[hero] ' : '       '}${f}`))

  const urls: string[] = []
  for (const file of files) {
    const raw = await readFile(path.join(dir, file))
    const webp = await sharp(raw)
      .rotate()
      .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer()
    const meta = await sharp(webp).metadata()
    const baseName = path.basename(file).replace(/\.[^/.]+$/, '')
    const key = buildKey(`${baseName}.webp`)
    console.log(`  ${file}  ${(raw.length / 1024).toFixed(0)}KB -> ${(webp.length / 1024).toFixed(0)}KB (${meta.width}x${meta.height})`)

    if (go) {
      await getR2Client().send(
        new PutObjectCommand({ Bucket: getR2BucketName(), Key: key, Body: webp, ContentType: 'image/webp' }),
      )
    }
    urls.push(publicUrlForKey(key))
  }

  if (!go) {
    console.log('\nDry-run. Nada subido ni guardado. Corré con --go.')
    process.exit(0)
  }

  project.set('image', urls[0])
  project.set('images', urls.slice(1))
  await project.save()
  console.log(`\nSubidas ${urls.length} imágenes. image = 1ª, images[] = las otras ${urls.length - 1}.`)
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
