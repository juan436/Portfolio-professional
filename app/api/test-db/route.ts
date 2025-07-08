import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/conection';

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ 
      success: true, 
      message: 'Conexión a MongoDB establecida correctamente' 
    });
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error conectando a MongoDB',
      error: (error as Error).message
    }, { status: 500 });
  }
}