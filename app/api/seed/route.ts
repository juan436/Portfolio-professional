import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/conection';
import User from '@/models/user.model';
import Content from '@/models/content.model';

export async function GET() {
  try {
    await dbConnect();
    
    // Crear usuario administrador
    const adminExists = await User.findOne({ username: 'admin' });
    
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: 'admin123'
      });
    }
    
    // Crear contenido inicial
    const contentExists = await Content.findOne();
    
    if (!contentExists) {
      await Content.create({
        hero: {
          title: "Juan Villegas",
          subtitle: "Desarrollador Full Stack",
          description: "Programador Full Stack con enfoque en desarrollo eficiente y escalable.",
          profileImage: "https://example.com/profile.jpg"
        },
        about: {
          paragraph1: "Soy Juan Villegas, Programador Full Stack e Ingeniero en Telemática.",
          paragraph2: "En el frontend, utilizo React.js y Next.js para construir interfaces dinámicas.",
          paragraph3: "Mi formación en Telemática me proporciona un profundo conocimiento en redes."
        },
        services: [
          {
            title: "Desarrollo Frontend",
            description: "Interfaces modernas y responsivas con React y Next.js",
            icon: "Code"
          },
          {
            title: "Desarrollo Backend",
            description: "APIs robustas con Node.js y Express",
            icon: "Server"
          }
        ],
        contact: {
          email: "contacto@ejemplo.com",
          phone: "+1234567890",
          location: "Venezuela"
        }
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Datos iniciales creados correctamente' 
    });
  } catch (error) {
    console.error('Error creando datos iniciales:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error creando datos iniciales',
      error: (error as Error).message
    }, { status: 500 });
  }
}