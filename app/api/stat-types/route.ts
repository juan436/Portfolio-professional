import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/conection';
import StatType from '@/models/stat-type.model';

export async function GET() {
  await dbConnect();

  try {
    const types = await StatType.find().sort({ createdAt: 1 });
    return NextResponse.json({ success: true, data: types });
  } catch (error) {
    console.error('Error obteniendo tipos de estadística:', error);
    return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    const statType = new StatType(body);
    await statType.save();
    return NextResponse.json({ success: true, data: statType }, { status: 201 });
  } catch (error) {
    console.error('Error creando tipo de estadística:', error);
    return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 });
  }
}
