import mongoose from 'mongoose';
import Content from '../models/content.model';
import Project from '../models/project.model';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolioNew';

async function seed() {
  try {
    console.log(`Connecting to MongoDB at ${MONGODB_URI.split('@').pop()}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const heroUpdate = {
      title: "Estrategia Visual & Automatización Inteligente",
      subtitle: "Desarrollador Full Stack | Mobile (React Native) | Experto n8n",
      description: "Ayudo a empresas a escalar mediante soluciones web robustas, aplicaciones móviles nativas y flujos de lavoro automatizados con IA.",
      translations: {
        en: {
          title: "Visual Strategy & Intelligent Automation",
          subtitle: "Full Stack Developer | Mobile (React Native) | n8n Expert",
          description: "I help businesses scale through robust web solutions, native mobile apps, and AI-driven automated workflows."
        },
        fr: { title: "", subtitle: "", description: "" },
        it: { title: "", subtitle: "", description: "" }
      }
    };

    const servicesUpdate = [
      {
        title: "Sistemas Web & E-commerce",
        description: "E-commerce de Alta Conversión | Pasarelas de pago integradas | SEO optimizado para Google | Panel de control intuitivo",
        icon: "Layers",
        translations: {
          en: {
            title: "Web Systems & E-commerce",
            description: "High-Conversion E-commerce | Integrated payment gateways | SEO optimized for Google | Intuitive control panel"
          },
          fr: { title: "", description: "" },
          it: { title: "", description: "" }
        }
      },
      {
        title: "Aplicaciones Móviles Nativas",
        description: "Tu negocio en el bolsillo | Experiencias de alto rendimiento | Publicación en iOS & Android | Integración con hardware nativo",
        icon: "Smartphone",
        translations: {
          en: {
            title: "Native Mobile Apps",
            description: "Your business in their pockets | High-performance experiences | iOS & Android publishing | Native hardware integration"
          },
          fr: { title: "", description: "" },
          it: { title: "" , description: "" }
        }
      },
      {
        title: "Automatización AI (n8n)",
        description: "Libera 20h de tu semana | Conexión total entre tus apps | Bots de WhatsApp 24/7 | Reportes automáticos en tiempo real",
        icon: "Zap",
        translations: {
          en: {
            title: "AI Automation (n8n)",
            description: "Free up 20h of your week | Total connection between your apps | 24/7 WhatsApp bots | Real-time automated reports"
          },
          fr: { title: "", description: "" },
          it: { title: "" , description: "" }
        }
      },
      {
        title: "Infraestructura Cloud Ops",
        description: "Escalabilidad & Seguridad Total | Despliegues automatizados | Alta disponibilidad 99.9% | Protección avanzada de datos",
        icon: "Cloud",
        translations: {
          en: {
            title: "Cloud Ops Infrastructure",
            description: "Scalability & Total Security | Automated deployments | 99.9% High availability | Advanced data protection"
          },
          fr: { title: "", description: "" },
          it: { title: "" , description: "" }
        }
      }
    ];

    const labProjects = [
      {
        title: "AI Workflow Engine",
        description: "Motor de flujos de trabajo autónomos usando n8n y GPT-4 para procesamiento de lenguaje natural.",
        category: "laboratory",
        tags: ["n8n", "AI", "Python"],
        github: "https://github.com/juan436",
        demo: "#",
        translations: {
          en: {
            title: "AI Workflow Engine",
            description: "Autonomous workflow engine using n8n and GPT-4 for natural language processing."
          }
        }
      },
      {
        title: "Neural Vision Dashboard",
        description: "Panel de control experimental para visualización de redes neuronales en tiempo real.",
        category: "laboratory",
        tags: ["React", "Three.js", "TensorFlow"],
        github: "https://github.com/juan436",
        demo: "#",
        translations: {
          en: {
            title: "Neural Vision Dashboard",
            description: "Experimental dashboard for real-time neural network visualization."
          }
        }
      }
    ];

    const existingContent = await Content.findOne();

    if (existingContent) {
      console.log('Found existing content. Deleting to re-seed...');
      await Content.deleteOne({ _id: existingContent._id });
    }
    
    console.log('Creating new content...');
    await Content.create({
      hero: {
        ...heroUpdate,
        profileImage: existingContent?.hero?.profileImage || "/placeholder-user.jpg"
      },
      services: servicesUpdate,
      about: existingContent?.about || {
        paragraph1: "...",
        paragraph2: "...",
        paragraph3: "...",
        translations: {
          en: { paragraph1: "", paragraph2: "", paragraph3: "" },
          fr: { paragraph1: "", paragraph2: "", paragraph3: "" },
          it: { paragraph1: "", paragraph2: "", paragraph3: "" }
        }
      },
      contact: existingContent?.contact || {
        email: "...",
        phone: "...",
        location: "...",
        translations: {
          en: { location: "" },
          fr: { location: "" },
          it: { location: "" }
        }
      }
    });

    console.log('Cleaning existing laboratory projects...');
    await Project.deleteMany({ category: 'laboratory' });
    
    console.log('Seeding laboratory projects...');
    await Project.insertMany(labProjects);

    console.log('Content and Lab projects seeded successfully');

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();
