import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/conection';
import Content from '@/models/content.model';

/**
 * `/api/content` — CRUD del documento único de contenido de la home.
 * GET: sin body, devuelve el contenido vigente. POST: crea el documento (solo si no existe todavía).
 * PATCH: merge recursivo del body sobre el documento existente (services[] se matchea por `_id`).
 * Nota: las mutaciones reales del Admin ya viven en Server Actions (lib/actions/content.ts);
 * esta ruta queda como API pública/legacy de solo lectura en la práctica (GET).
 */
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
    
    const updateNestedFields = (source: any, target: any) => {
      Object.keys(source).forEach(key => {
        if (source[key] && Array.isArray(source[key])) {
          if (key === 'services') {
            if (!target[key]) target[key] = [];
            
            source[key].forEach((item: any) => {
              if (item._id) {
                const existingIndex = target[key].findIndex(
                  (existing: any) => existing._id?.toString() === item._id.toString()
                );
                
                if (existingIndex >= 0) {
                  target[key][existingIndex] = {
                    ...target[key][existingIndex],
                    ...item
                  };
                } else {
                  target[key].push(item);
                }
              } else {
                target[key].push(item);
              }
            });
          } else {
            target[key] = source[key];
          }
        } 
        else if (source[key] && typeof source[key] === 'object') {
          if (!target[key]) target[key] = {};
          updateNestedFields(source[key], target[key]);
        } else {
          target[key] = source[key];
        }
      });
    };
    
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
