import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/conection';
import Certificate from '@/models/certificate.model';

// GET: Obtener todos los certificados
export async function GET() {
  await dbConnect();

  try {
    const certificates = await Certificate.find().sort({ date: -1 });

    return NextResponse.json({
      success: true,
      data: certificates
    });
  } catch (error) {
    console.error('Error obteniendo certificados:', error);
    return NextResponse.json({
      success: false,
      message: 'Error del servidor'
    }, { status: 500 });
  }
}

// POST: Crear un nuevo certificado
export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();

    const certificate = new Certificate(body);
    await certificate.save();

    return NextResponse.json({
      success: true,
      data: certificate
    }, { status: 201 });
  } catch (error) {
    console.error('Error creando certificado:', error);
    return NextResponse.json({
      success: false,
      message: 'Error del servidor'
    }, { status: 500 });
  }
}
