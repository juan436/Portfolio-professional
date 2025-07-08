import mongoose, { Document, Model } from 'mongoose';

// Interfaces para los subdocumentos
interface IHero {
  title: string;
  subtitle: string;
  description: string;
  profileImage: string;
  translations?: {
    en?: {
      title: string;
      subtitle: string;
      description: string;
    };
    fr?: {
      title: string;
      subtitle: string;
      description: string;
    };
    it?: {
      title: string;
      subtitle: string;
      description: string;
    };
  };
}

interface IAbout {
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  translations?: {
    en?: {
      paragraph1: string;
      paragraph2: string;
      paragraph3: string;
    };
    fr?: {
      paragraph1: string;
      paragraph2: string;
      paragraph3: string;
    };
    it?: {
      paragraph1: string;
      paragraph2: string;
      paragraph3: string;
    };
  };
}

interface IContact {
  email: string;
  phone: string;
  location: string;
  translations?: {
    en?: {
      location: string;
    };
    fr?: {
      location: string;
    };
    it?: {
      location: string;
    };
  };
}

interface IService {
  title: string;
  description: string;
  icon: string;
  translations?: {
    en?: {
      title: string;
      description: string;
    };
    fr?: {
      title: string;
      description: string;
    };
    it?: {
      title: string;
      description: string;
    };
  };
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
    translations: {
      en: {
        title: String,
        subtitle: String,
        description: String,
      },
      fr: {
        title: String,
        subtitle: String,
        description: String,
      },
      it: {
        title: String,
        subtitle: String,
        description: String,
      }
    }
  },
  about: {
    paragraph1: String,
    paragraph2: String,
    paragraph3: String,
    translations: {
      en: {
        paragraph1: String,
        paragraph2: String,
        paragraph3: String,
      },
      fr: {
        paragraph1: String,
        paragraph2: String,
        paragraph3: String,
      },
      it: {
        paragraph1: String,
        paragraph2: String,
        paragraph3: String,
      }
    }
  },
  services: [{
    title: String,
    description: String,
    icon: String,
    translations: {
      en: {
        title: String,
        description: String,
      },
      fr: {
        title: String,
        description: String,
      },
      it: {
        title: String,
        description: String,
      }
    }
  }],
  contact: {
    email: String,
    phone: String,
    location: String,
    translations: {
      en: {
        location: String,
      },
      fr: {
        location: String,
      },
      it: {
        location: String,
      }
    }
  }
}, { 
  timestamps: true 
});

export default mongoose.models.Content as Model<IContent> || mongoose.model<IContent>('Content', ContentSchema);
