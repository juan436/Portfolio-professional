import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db/conection'
import User from '@/models/user.model'
import jwt from 'jsonwebtoken'

export async function POST(request: Request) {
  await dbConnect()

  try {
    let username, password;
    
    try {
      const text = await request.text();
      
      if (!text || text.trim() === '') {
        return NextResponse.json(
          { success: false, message: 'Cuerpo de solicitud vacío' },
          { status: 400 }
        );
      }
      const body = JSON.parse(text);
      username = body.username;
      password = body.password;
    } catch (parseError) {
      console.error('❌ [auth] Error parsing request body:', parseError);
      return NextResponse.json(
        { success: false, message: 'Formato de solicitud inválido' },
        { status: 400 }
      );
    }
    
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const user = await User.findOne({ username })
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuario no existe' },
        { status: 401 }
      )
    }

    const isValid = await user.comparePassword(password)
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Contraseña incorrecta' },
        { status: 401 }
      )
    }

    const token = jwt.sign(
      { sub: user._id.toString(), username: user.username },
      process.env.SECRET_KEY!,
      { expiresIn: '2h' }
    )

    const response = NextResponse.json(
      {
        success: true,
        message: 'Autenticación exitosa',
        token,
        user: { id: user._id, username: user.username }
      },
      { status: 200 }
    );
    
    response.cookies.set('authToken', token, {
      path: '/',
      maxAge: 60 * 60 * 2, 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax', 
    });
    
    response.cookies.set('isLoggedIn', 'true', {
      path: '/',
      maxAge: 60 * 60 * 2,
      httpOnly: false, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax', 
    });
    
    response.cookies.set('adminUser', username, {
      path: '/',
      maxAge: 60 * 60 * 2,
      httpOnly: false, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax', 
    });
    
    return response;
  } catch (err) {
    console.error('❌ [auth] Error en autenticación:', err)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}