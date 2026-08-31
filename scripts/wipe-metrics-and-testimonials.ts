
import dbConnect from '../lib/db/conection'
import ProjectStats from '../models/project-stats.model'
import Testimonial from '../models/testimonial.model'

async function run() {
  const go = process.argv.includes('--go')
  await dbConnect()

  const stats = await ProjectStats.countDocuments()
  const tests = await Testimonial.countDocuments()
  console.log(`ProjectStats: ${stats} documentos`)
  console.log(`Testimonial:  ${tests} documentos`)

  if (!go) {
    console.log('\nDry-run. Nada borrado. Corré con --go para vaciar ambas colecciones.')
    process.exit(0)
  }

  const r1 = await ProjectStats.deleteMany({})
  const r2 = await Testimonial.deleteMany({})
  console.log(`\nBorrados: ${r1.deletedCount} ProjectStats, ${r2.deletedCount} Testimonial.`)
  process.exit(0)
}

run().catch((e) => { console.error(e); process.exit(1) })
