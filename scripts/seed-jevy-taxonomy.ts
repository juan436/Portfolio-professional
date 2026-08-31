
import dbConnect from '../lib/db/conection'
import JevyTaxonomy from '../models/jevy-taxonomy.model'
import {
  JEVY_CATEGORIAS_SEED,
  JEVY_SUBTYPES_SEED,
  JEVY_PROBLEMAS_CORE_SEED,
  JEVY_SECTORES_SEED,
} from '../lib/jevy-taxonomy'

async function seed() {
  try {
    await dbConnect()

    const existing = await JevyTaxonomy.findOne({})
    const payload = {
      categorias: JEVY_CATEGORIAS_SEED,
      subtypes: JEVY_SUBTYPES_SEED,
      problemasCore: JEVY_PROBLEMAS_CORE_SEED,
      sectores: JEVY_SECTORES_SEED,
    }

    if (existing) {
      await JevyTaxonomy.updateOne({ _id: existing._id }, { $set: payload })
      console.log('JevyTaxonomy actualizado con la semilla')
    } else {
      await JevyTaxonomy.create(payload)
      console.log('JevyTaxonomy creado con la semilla')
    }

    process.exit(0)
  } catch (error) {
    console.error('Error poblando JevyTaxonomy:', error)
    process.exit(1)
  }
}

seed()
