import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/conection';
import OtherSkill from '@/models/otherSkills.model';

// GET: Obtener todas las otras habilidades
export async function GET() {
  await dbConnect();
  
  try {
    const skills = await OtherSkill.find();
    return NextResponse.json({ success: true, data: skills });
  } catch (error) {
    console.error('Error obteniendo otras habilidades:', error);
    return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 });
  }
}

// POST: Crear una nueva otra habilidad
export async function POST(request: Request) {
  await dbConnect();
  
  try {
    const body = await request.json();
    const skill = new OtherSkill(body);
    await skill.save();
    return NextResponse.json({ success: true, data: skill }, { status: 201 });
  } catch (error) {
    console.error('Error creando otra habilidad:', error);
    return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 });
  }
}