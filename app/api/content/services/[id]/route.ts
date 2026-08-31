import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/conection';
import Content from '@/models/content.model';
import mongoose from 'mongoose';

/**
 * `/api/content/services/[id]` — DELETE de un servicio embebido en el documento único de Content.
 * Recibe: `params.id` (ObjectId del sub-documento a borrar).
 * Produce: `{ success, message }`; 400 si el id es inválido, 404 si no existe.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID de servicio inválido' 
      }, { status: 400 });
    }
    
    const content = await Content.findOne();
    
    if (!content) {
      return NextResponse.json({ 
        success: false, 
        message: 'No se encontró contenido' 
      }, { status: 404 });
    }
    
    const serviceIndex = content.services.findIndex(
      (service: any) => service._id.toString() === id
    );
    
    if (serviceIndex === -1) {
      console.error(`[API/DELETE] Servicio no encontrado con ID: ${id}`);
      return NextResponse.json({ 
        success: false, 
        message: 'Servicio no encontrado' 
      }, { status: 404 });
    }
    
    content.services.splice(serviceIndex, 1);
    
    await content.save();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Servicio eliminado correctamente' 
    });
  } catch (error) {
    console.error('[API/DELETE] Error eliminando servicio:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Error del servidor' 
    }, { status: 500 });
  }
}
