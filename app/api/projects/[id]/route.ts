import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/conection';
import Project from '@/models/project.model';

// GET: Obtener un proyecto por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
    const { id } = await params;
    const project = await Project.findById(id);
    
    if (!project) {
      return NextResponse.json({ 
        success: false, 
        message: 'Proyecto no encontrado' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: project 
    });
  } catch (error) {
    console.error('Error obteniendo proyecto:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error del servidor' 
    }, { status: 500 });
  }
}

// DELETE: Eliminar un proyecto
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
    const { id } = await params;
    const project = await Project.findByIdAndDelete(id);
    
    if (!project) {
      return NextResponse.json({ 
        success: false, 
        message: 'Proyecto no encontrado' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Proyecto eliminado correctamente' 
    });
  } catch (error) {
    console.error('Error eliminando proyecto:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error del servidor' 
    }, { status: 500 });
  }
}

// PATCH: Actualizar parcialmente un proyecto
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
    // Esperar a que params esté disponible y extraer el id
    const { id } = await params;
    const body = await request.json();
    
    const project = await Project.findById(id);
    
    if (!project) {
      return NextResponse.json({ 
        success: false, 
        message: 'Proyecto no encontrado' 
      }, { status: 404 });
    }
    
    // Actualizar solo los campos enviados
    Object.keys(body).forEach(key => {
      (project as any)[key] = body[key];
    });
    
    await project.save();
    
    return NextResponse.json({ 
      success: true, 
      data: project 
    });
  } catch (error) {
    console.error('Error actualizando proyecto:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error del servidor',
      error: (error as Error).message
    }, { status: 500 });
  }
}