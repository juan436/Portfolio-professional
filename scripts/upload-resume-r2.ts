/**
 * Sube un PDF local a R2 tal cual (sin recomprimir, no es imagen) bajo
 * `resumes/<nombre>.pdf` e imprime la URL pública. NO toca Mongo.
 *
 * Uso:
 *   npx tsx --env-file=.env scripts/upload-resume-r2.ts <ruta-local.pdf> <nombre-archivo-sin-extension> [--go]
 *   (sin --go: dry-run — muestra key/URL, no sube)
 */
import { readFile } from 'fs/promises'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getR2Client, getR2BucketName, isR2Configured, publicUrlForKey } from '../lib/storage/r2'

async function run() {
  const args = process.argv.slice(2)
  const [localPath, name] = args.filter((a) => !a.startsWith('--'))
  const go = args.includes('--go')

  if (!localPath || !name) {
    console.error('Uso: upload-resume-r2.ts <ruta-local.pdf> <nombre-archivo-sin-extension> [--go]')
    process.exit(1)
  }
  if (!isR2Configured()) {
    console.error('R2 no configurado en .env')
    process.exit(1)
  }

  const buf = await readFile(localPath)
  const key = `resumes/${name}.pdf`
  const url = publicUrlForKey(key)

  console.log(`Tamaño : ${(buf.length / 1024).toFixed(0)} KB`)
  console.log(`Key    : ${key}`)
  console.log(`URL    : ${url}`)

  if (!go) {
    console.log('\nDry-run. Nada subido. Corré con --go.')
    return
  }
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: getR2BucketName(),
      Key: key,
      Body: buf,
      ContentType: 'application/pdf',
      ContentDisposition: `inline; filename="${name}.pdf"`,
    }),
  )
  console.log('\nSubido a R2.')
}

run().catch((e) => { console.error(e); process.exit(1) })
