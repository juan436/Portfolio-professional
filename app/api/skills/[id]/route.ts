import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/conection';
import Skill from '@/models/skill.model';

// GET: Obtener una habilidad por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
    // Esperar a que params esté disponible y extraer el id
    const { id } = await params;
    
    const skill = await Skill.findById(id);
    
    if (!skill) {
      return NextResponse.json({ 
        success: false, 
        message: 'Habilidad no encontrada' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: skill 
    });
  } catch (error) {
    console.error('Error obteniendo habilidad:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error del servidor' 
    }, { status: 500 });
  }
}

// DELETE: Eliminar una habilidad
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
    // Esperar a que params esté disponible y extraer el id
    const { id } = await params;
    
    const skill = await Skill.findByIdAndDelete(id);
    
    if (!skill) {
      return NextResponse.json({ 
        success: false, 
        message: 'Habilidad no encontrada' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Habilidad eliminada correctamente' 
    });
  } catch (error) {
    console.error('Error eliminando habilidad:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error del servidor' 
    }, { status: 500 });
  }
}

// PATCH: Actualizar parcialmente una habilidad
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
    // Esperar a que params esté disponible y extraer el id
    const { id } = await params;
    
    const body = await request.json();
    
    const skill = await Skill.findById(id);
    
    if (!skill) {
      return NextResponse.json({ 
        success: false, 
        message: 'Habilidad no encontrada' 
      }, { status: 404 });
    }
    
    // Actualizar solo los campos enviados
    Object.keys(body).forEach(key => {
      (skill as any)[key] = body[key];
    });
    
    await skill.save();
    
    return NextResponse.json({ 
      success: true, 
      data: skill 
    });
  } catch (error) {
    console.error('Error actualizando habilidad:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error del servidor',
      error: (error as Error).message
    }, { status: 500 });
  }
}