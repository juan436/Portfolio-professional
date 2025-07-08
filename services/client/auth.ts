import { getApiUrl } from '@/utils/url';

export async function authenticateUser(username: string, password: string) {
  try {
    const response = await fetch(`${getApiUrl()}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        token: data.token,
        user: data.user,
        message: data.message
      };
    } else {
      return {
        success: false,
        message: data.message || 'Error de autenticación'
      };
    }
  } catch (error) {
    console.error('Error en la autenticación:', error);
    return { 
      success: false, 
      message: 'Error interno del servidor' 
    };
  }
}
