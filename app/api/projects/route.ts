import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/conection';
import Project from '@/models/project.model';

// GET: Obtener todos los proyectos o filtrar por categoría
export async function GET(request: Request) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let query = {};
    if (category) {
      query = { category };
    }
    
    const projects = await Project.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({ 
      success: true, 
      data: projects 
    });
  } catch (error) {
    console.error('Error obteniendo proyectos:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error del servidor' 
    }, { status: 500 });
  }
}

// POST: Crear un nuevo proyecto
export async function POST(request: Request) {
  await dbConnect();
  
  try {
    const body = await request.json();
    
    const project = new Project(body);
    await project.save();
    
    return NextResponse.json({ 
      success: true, 
      data: project 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creando proyecto:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error del servidor' 
    }, { status: 500 });
  }
}