// remove-lab-test-data.ts
// Borra los experimentos [TEST] creados por seed-lab-details-test.ts.

import dbConnect from '../lib/db/conection'
import Project from '../models/project.model'

async function remove() {
  try {
    await dbConnect()
    const result = await Project.deleteMany({ category: 'laboratory', title: { $regex: '^\\[TEST\\]' } })
    console.log(`Eliminados ${result.deletedCount} experimentos de prueba.`)
    process.exit(0)
  } catch (error) {
    console.error('Error eliminando datos de prueba:', error)
    process.exit(1)
  }
}

remove()
