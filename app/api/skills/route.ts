import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/conection';
import Skill from '@/models/skill.model';

// GET: Obtener todas las habilidades o filtrar por categoría
export async function GET(request: Request) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let query = {};
    if (category) {
      query = { category };
    }
    
    const skills = await Skill.find(query).sort({ name: 1 });
    
    return NextResponse.json({ 
      success: true, 
      data: skills 
    });
  } catch (error) {
    console.error('Error obteniendo habilidades:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error del servidor' 
    }, { status: 500 });
  }
}

// POST: Crear una nueva habilidad
export async function POST(request: Request) {
  await dbConnect();
  
  try {
    const body = await request.json();
    
    const skill = new Skill(body);
    await skill.save();
    
    return NextResponse.json({ 
      success: true, 
      data: skill 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creando habilidad:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error del servidor' 
    }, { status: 500 });
  }
}