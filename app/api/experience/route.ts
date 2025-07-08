import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/conection';
import Experience from '@/models/experience.model';

// GET - Obtener todas las experiencias
export async function GET() {
  await dbConnect();
  
  try {
    const experiences = await Experience.find().sort({ createdAt: -1 });
    
    return NextResponse.json({ 
      success: true, 
      data: experiences 
    });
  } catch (error) {
    console.error('Error obteniendo experiencias:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error del servidor' 
    }, { status: 500 });
  }
}

// POST - Crear una nueva experiencia
export async function POST(request: Request) {
  await dbConnect();
  
  try {
    const body = await request.json();
    
    // Validar datos mínimos requeridos
    if (!body.position || !body.company || !body.period) {
      return NextResponse.json(
        { success: false, message: 'Faltan datos requeridos (position, company, period)' },
        { status: 400 }
      );
    }
    
    const experience = new Experience(body);
    await experience.save();
    
    return NextResponse.json({ 
      success: true, 
      data: experience,
      message: 'Experiencia creada correctamente'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creando experiencia:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error del servidor' 
    }, { status: 500 });
  }
}