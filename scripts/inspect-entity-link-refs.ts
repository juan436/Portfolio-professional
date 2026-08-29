// inspect-entity-link-refs.ts
// Solo lectura: reporta el estado de `link.ref` / `links[].ref` en ProjectStats
// y Testimonial contra la colección Project. Sirve de dry-run antes de la
// migración a ObjectId real.

import mongoose from 'mongoose'
import dbConnect from '../lib/db/conection'
import Project from '../models/project.model'
import ProjectStats from '../models/project-stats.model'
import Testimonial from '../models/testimonial.model'

async function run() {
  await dbConnect()

  const projects = await Project.find().select('_id slug title category').lean()
  const byId = new Map(projects.map((p: any) => [String(p._id), p]))
  const bySlug = new Map(projects.map((p: any) => [p.slug, p]))

  const classify = (ref: unknown) => {
    const s = String(ref)
    if (mongoose.isValidObjectId(s) && byId.has(s)) return `OK  -> ${byId.get(s)!.title} (${byId.get(s)!.category})`
    if (mongoose.isValidObjectId(s)) return `HUÉRFANO (ObjectId sin Project)`
    if (bySlug.has(s)) return `SLUG -> resolvible a ${bySlug.get(s)!._id} (${bySlug.get(s)!.title})`
    return `DESCONOCIDO (ni ObjectId ni slug)`
  }

  const stats = await ProjectStats.find().lean()
  console.log(`\n=== ProjectStats (${stats.length}) ===`)
  for (const s of stats as any[]) {
    console.log(`  _id=${s._id}  link.ref="${s.link?.ref}"  type=${s.link?.type}`)
    console.log(`     ${classify(s.link?.ref)}`)
    for (const m of s.metrics || []) console.log(`       · ${m.label} = ${m.value}${m.statType ? `  [statType:${m.statType}]` : ''}`)
  }

  const tests = await Testimonial.find().lean()
  console.log(`\n=== Testimonial (${tests.length}) ===`)
  for (const t of tests as any[]) {
    for (const l of t.links || []) {
      console.log(`  _id=${t._id}  author="${t.author}"  links.ref="${l.ref}"  type=${l.type}`)
      console.log(`     ${classify(l.ref)}  ::  ${String(t.content || '').slice(0, 80)}`)
    }
  }

  process.exit(0)
}

run().catch((e) => { console.error(e); process.exit(1) })
