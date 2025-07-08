import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/conection';
import Content from '@/models/content.model';
import mongoose from 'mongoose';

// DELETE: Eliminar un servicio específico por su ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  
  try {
    const id = params.id;
    
    // Validar que el ID sea un ObjectId válido de MongoDB
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: 'ID de servicio inválido' 
      }, { status: 400 });
    }
    
    // Buscar el documento de contenido
    const content = await Content.findOne();
    
    if (!content) {
      return NextResponse.json({ 
        success: false, 
        message: 'No se encontró contenido' 
      }, { status: 404 });
    }
    
    // Verificar si el servicio existe
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
    
    // Eliminar el servicio del array
    content.services.splice(serviceIndex, 1);
    
    // Guardar los cambios
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
