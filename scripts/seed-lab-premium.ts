// seed-lab-premium.ts
import dbConnect from '../lib/db/conection';
import Project from '../models/project.model';

async function seed() {
  try {
    await dbConnect();
    
    // Limpiar anteriores
    await Project.deleteMany({ category: 'laboratory' }); 
    console.log("Limpieza de experimentos de laboratorio completada.");
    
    const experiments = [
      {
        title: "AI Workflow Engine",
        description: "Motor de flujos de trabajo autónomos usando n8n y GPT-4o.",
        category: "laboratory",
        image: "/images/lab/lab-ai.png",
        video: "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/person-bicycle-car-detection.mp4",
        tags: ["n8n", "AI", "Python"]
      },
      {
        title: "Neural Vision Dashboard",
        description: "Visualización en tiempo real de redes neuronales convolucionales.",
        category: "laboratory",
        image: "/images/lab/lab-neural.png",
        video: "https://v.ftcdn.net/04/79/12/32/700_F_479123285_7ZpQ2YmFkzNfVQpYhRXqVgFzXqNqVzNq.mp4",
        tags: ["TensorFlow", "Three.js"]
      },
      {
        title: "Admin Money AI",
        description: "Gestión financiera inteligente con predicción de gastos.",
        category: "laboratory",
        image: "/images/lab/lab-finance.png",
        video: "https://v.ftcdn.net/04/79/12/32/700_F_479123285_7ZpQ2YmFkzNfVQpYhRXqVgFzXqNqVzNq.mp4",
        tags: ["React Native", "AI", "NestJS"]
      }
    ];

    // Inyectar el contenido premium
    await Project.insertMany(experiments);
    console.log("¡Laboratorio Premium Activado!");
    process.exit(0);
  } catch (error) {
    console.error("Error al activar el laboratorio premium:", error);
    process.exit(1);
  }
}

seed();
