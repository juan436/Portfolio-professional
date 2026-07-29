import mongoose from 'mongoose';
import Content from '../models/content.model';

const MONGODB_URI = 'mongodb://localhost:27017/portfolioNew';

async function revert() {
  try {
    console.log('Conectando a MongoDB para revertir cambios...');
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado con éxito.');

    const heroRevert = {
      title: "Estrategia Visual & Automatización Inteligente",
      subtitle: "Desarrollador Full Stack | Mobile (React Native) | Experto n8n",
      description: "Ayudo a empresas a escalar mediante soluciones web robustas, aplicaciones móviles nativas y flujos de lavoro automatizados con IA.",
      translations: {
        en: {
          title: "Visual Strategy & Intelligent Automation",
          subtitle: "Full Stack Developer | Mobile (React Native) | n8n Expert",
          description: "I help businesses scale through robust web solutions, native mobile apps, and AI-driven automated workflows."
        },
        fr: { 
          title: "Stratégie Visuelle & Automatisation Intelligente", 
          subtitle: "Développeur Full Stack | Mobile (React Native) | Expert n8n", 
          description: "J'aide les entreprises à évoluer grâce à des solutions web robustes, des applications mobiles natives et des flux de travail automatisés par l'IA." 
        },
        it: { 
          title: "Strategia Visiva e Automazione Intelligente", 
          subtitle: "Sviluppatore Full Stack | Mobile (React Native) | Esperto n8n", 
          description: "Aiuto le aziende a scalare attraverso solide soluzioni web, app mobili native e flussi di lavoro automatizzati con l'IA." 
        }
      }
    };

    const servicesRevert = [
      {
        title: "Sistemas Web & E-commerce",
        description: "E-commerce de Alta Conversión | Pasarelas de pago integradas | SEO optimizado para Google | Panel de control intuitivo",
        icon: "Layers",
        translations: {
          en: {
            title: "Web Systems & E-commerce",
            description: "High-Conversion E-commerce | Integrated payment gateways | SEO optimized for Google | Intuitive control panel"
          }
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
          }
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
          }
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
          }
        }
      }
    ];

    console.log('Buscando documento de contenido existente...');
    const content = await Content.findOne();

    if (content) {
      console.log('Revirtiendo Hero y Servicios...');
      content.hero = {
        ...content.hero,
        ...heroRevert
      };
      content.services = servicesRevert;
      await content.save();
      console.log('¡Éxito! Base de datos revertida a la identidad original.');
    } else {
      console.log('No se encontró documento de contenido para revertir.');
    }

  } catch (error) {
    console.error('Error durante la reversión:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB.');
  }
}

revert();
