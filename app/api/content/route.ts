import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/conection';
import Content from '@/models/content.model';

// GET: Obtener todo el contenido
export async function GET() {
  await dbConnect();
  
  try {
    const content = await Content.findOne().sort({ createdAt: -1 });
    
    if (!content) {
      return NextResponse.json({ 
        success: false, 
        message: 'No se encontró contenido' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: content 
    });
  } catch (error) {
    console.error('Error obteniendo contenido:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error del servidor' 
    }, { status: 500 });
  }
}

// POST: Crear contenido
export async function POST(request: Request) {
  await dbConnect();
  
  try {
    const body = await request.json();
    
    const content = new Content(body);
    await content.save();
    
    return NextResponse.json({ 
      success: true, 
      data: content 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creando contenido:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error del servidor' 
    }, { status: 500 });
  }
}

// PATCH: Actualizar contenido parcialmente de forma dinámica
export async function PATCH(request: Request) {
  await dbConnect();
  
  try {
    const body = await request.json();
    
    const existingContent = await Content.findOne();
    
    if (!existingContent) {
      const newContent = new Content(body);
      await newContent.save();
      
      return NextResponse.json({ 
        success: true, 
        data: newContent 
      }, { status: 201 });
    }
    
    // Función recursiva para actualizar campos anidados
    const updateNestedFields = (source: any, target: any) => {
      Object.keys(source).forEach(key => {
        // Caso especial para arrays (como services)
        if (source[key] && Array.isArray(source[key])) {
          // Si es la sección de servicios, manejar de forma especial
          if (key === 'services') {
            // Si no existe el array en el target, crearlo
            if (!target[key]) target[key] = [];
            
            // Para cada elemento en el array fuente
            source[key].forEach((item: any) => {
              // Si el item tiene ID, buscar y actualizar
              if (item._id) {
                const existingIndex = target[key].findIndex(
                  (existing: any) => existing._id?.toString() === item._id.toString()
                );
                
                if (existingIndex >= 0) {
                  // Actualizar el item existente
                  target[key][existingIndex] = {
                    ...target[key][existingIndex],
                    ...item
                  };
                } else {
                  // Agregar como nuevo si no existe
                  target[key].push(item);
                }
              } else {
                // Si no tiene ID, es un nuevo item
                target[key].push(item);
              }
            });
          } else {
            // Para otros arrays, reemplazar directamente
            target[key] = source[key];
          }
        } 
        // Si es un objeto y no un array, actualiza recursivamente
        else if (source[key] && typeof source[key] === 'object') {
          if (!target[key]) target[key] = {};
          updateNestedFields(source[key], target[key]);
        } else {
          // Actualiza el valor
          target[key] = source[key];
        }
      });
    };
    
    // Actualizar campos de manera dinámica
    updateNestedFields(body, existingContent);
    
    await existingContent.save();
    return NextResponse.json({ 
      success: true, 
      data: existingContent 
    });
  } catch (error) {
    console.error('Error actualizando contenido:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error del servidor',
      error: (error as Error).message
    }, { status: 500 });
  }
}
