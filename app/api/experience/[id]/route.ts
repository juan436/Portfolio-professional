import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/conection';
import Experience from '@/models/experience.model';

// GET: Obtener una experiencia por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
    const { id } = await params;
    const experience = await Experience.findById(id);
    
    if (!experience) {
      return NextResponse.json({ 
        success: false, 
        message: 'Experiencia no encontrada' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: experience 
    });
  } catch (error) {
    console.error('Error obteniendo experiencia:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error del servidor' 
    }, { status: 500 });
  }
}

// PATCH: Actualizar parcialmente una experiencia
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
    const { id } = await params;
    const body = await request.json();
    
    const experience = await Experience.findById(id);
    
    if (!experience) {
      return NextResponse.json({ 
        success: false, 
        message: 'Experiencia no encontrada' 
      }, { status: 404 });
    }
    
    // Actualizar solo los campos enviados
    Object.keys(body).forEach(key => {
      (experience as any)[key] = body[key];
    });
    
    await experience.save();
    
    return NextResponse.json({ 
      success: true, 
      data: experience,
      message: 'Experiencia actualizada correctamente'
    });
  } catch (error) {
    console.error('Error actualizando experiencia:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error del servidor',
      error: (error as Error).message
    }, { status: 500 });
  }
}

// DELETE: Eliminar una experiencia
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
    const { id } = await params;
    const experience = await Experience.findByIdAndDelete(id);
    
    if (!experience) {
      return NextResponse.json({ 
        success: false, 
        message: 'Experiencia no encontrada' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Experiencia eliminada correctamente' 
    });
  } catch (error) {
    console.error('Error eliminando experiencia:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error del servidor' 
    }, { status: 500 });
  }
}