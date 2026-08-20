import mongoose, { Document, Model } from 'mongoose';

/**
 * Modelo Mongoose del contenido único de la home (singleton, un solo documento).
 * Recibe: hero/about/services[]/contact, con traducciones opcionales en/fr/it por sección.
 * Produce: `Content`, listo para `findOne`/`save` contra la colección `contents`.
 */
// El bloque translations: { en, fr, it } se repetía 4 veces (interfaz TS y
// schema Mongoose) — colapsado acá, mismo espíritu que localeContentFields()
// en project.model.ts. `build()` se llama 3 veces a propósito (no se reusa
// un solo objeto para en/fr/it) para no compartir la misma referencia de
// definición de schema entre los 3 paths, igual que ya hace project.model.ts.
type LocaleTranslations<T> = {
  en?: T;
  fr?: T;
  it?: T;
};

function localeSchemaFields<T>(build: () => T) {
  return { en: build(), fr: build(), it: build() };
}

// Interfaces para los subdocumentos
interface IHero {
  title: string;
  subtitle: string;
  description: string;
  profileImage: string;
  translations?: LocaleTranslations<{
    title: string;
    subtitle: string;
    description: string;
  }>;
}

interface IAbout {
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  translations?: LocaleTranslations<{
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
  }>;
}

interface IContact {
  email: string;
  phone: string;
  location: string;
  translations?: LocaleTranslations<{
    location: string;
  }>;
}

interface IService {
  title: string;
  description: string;
  icon: string;
  translations?: LocaleTranslations<{
    title: string;
    description: string;
  }>;
}

// Interfaz para el documento principal
export interface IContent extends Document {
  hero: IHero;
  about: IAbout;
  services: IService[];
  contact: IContact;
}

const ContentSchema = new mongoose.Schema({
  hero: {
    title: String,
    subtitle: String,
    description: String,
    profileImage: String,
    translations: localeSchemaFields(() => ({
      title: String,
      subtitle: String,
      description: String,
    })),
  },
  about: {
    paragraph1: String,
    paragraph2: String,
    paragraph3: String,
    translations: localeSchemaFields(() => ({
      paragraph1: String,
      paragraph2: String,
      paragraph3: String,
    })),
  },
  services: [{
    title: String,
    description: String,
    icon: String,
    translations: localeSchemaFields(() => ({
      title: String,
      description: String,
    })),
  }],
  contact: {
    email: String,
    phone: String,
    location: String,
    translations: localeSchemaFields(() => ({
      location: String,
    })),
  }
}, {
  timestamps: true
});

export default mongoose.models.Content as Model<IContent> || mongoose.model<IContent>('Content', ContentSchema);
