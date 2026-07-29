// seed-lab.ts
import dbConnect from '../lib/db/conection';
import Project from '../models/project.model';

async function seed() {
  try {
    await dbConnect();
    
    const labProject = {
      title: "Admin Money AI Dashboard",
      description: "Experimento de interfaz reactiva y automatización de flujos financieros con n8n.",
      category: "laboratory",
      tags: ["React Native", "n8n", "AI"],
      video: "https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-abstract-nebula-4824-large.mp4", // Video de prueba premium
      github: "https://github.com",
      demo: "https://demo.com"
    };

    // Crear el proyecto
    await Project.create(labProject);
    console.log("¡Magia activada! Proyecto de Laboratorio creado.");
    process.exit(0);
  } catch (error) {
    console.error("Error al activar la magia:", error);
    process.exit(1);
  }
}

seed();
