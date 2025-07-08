import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/conection';
import OtherSkill from '@/models/otherSkills.model';

// PATCH: Actualizar una otra habilidad
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  
  try {
    const body = await request.json();
    // Esperar a que params esté disponible y extraer el id
    const { id } = await params;
    
    const skill = await OtherSkill.findByIdAndUpdate(id, body, { new: true });
    
    if (!skill) {
      return NextResponse.json({ success: false, message: 'Habilidad no encontrada' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: skill });
  } catch (error) {
    console.error('Error actualizando otra habilidad:', error);
    return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 });
  }
}

// DELETE: Eliminar una otra habilidad
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  
  try {
    // Esperar a que params esté disponible y extraer el id
    const { id } = await params;
    
    const skill = await OtherSkill.findByIdAndDelete(id);
    
    if (!skill) {
      return NextResponse.json({ success: false, message: 'Habilidad no encontrada' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Habilidad eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando otra habilidad:', error);
    return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 });
  }
}