import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/conection';
import Certificate from '@/models/certificate.model';

// GET: Obtener un certificado por id
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const { id } = await params;
    const certificate = await Certificate.findById(id);

    if (!certificate) {
      return NextResponse.json({
        success: false,
        message: 'Certificado no encontrado'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: certificate
    });
  } catch (error) {
    console.error('Error obteniendo certificado:', error);
    return NextResponse.json({
      success: false,
      message: 'Error del servidor'
    }, { status: 500 });
  }
}

// PATCH: Actualizar parcialmente un certificado
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const { id } = await params;
    const body = await request.json();

    const certificate = await Certificate.findById(id);

    if (!certificate) {
      return NextResponse.json({
        success: false,
        message: 'Certificado no encontrado'
      }, { status: 404 });
    }

    Object.keys(body).forEach(key => {
      (certificate as any)[key] = body[key];
    });

    await certificate.save();

    return NextResponse.json({
      success: true,
      data: certificate
    });
  } catch (error) {
    console.error('Error actualizando certificado:', error);
    return NextResponse.json({
      success: false,
      message: 'Error del servidor'
    }, { status: 500 });
  }
}

// DELETE: Eliminar un certificado
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();

  try {
    const { id } = await params;
    const certificate = await Certificate.findByIdAndDelete(id);

    if (!certificate) {
      return NextResponse.json({
        success: false,
        message: 'Certificado no encontrado'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Certificado eliminado correctamente'
    });
  } catch (error) {
    console.error('Error eliminando certificado:', error);
    return NextResponse.json({
      success: false,
      message: 'Error del servidor'
    }, { status: 500 });
  }
}
