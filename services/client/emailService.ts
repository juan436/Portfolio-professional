/**
 * Servicio para manejar la comunicación con el servidor de correo
 */

/**
 * Datos del formulario de contacto
 */
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  language?: string;
}

/**
 * Respuesta del servicio de correo electrónico
 */
export interface EmailResponse {
  status: 'success' | 'error';
  message: string;
  errors?: string[];
}

// Valores por defecto para desarrollo y producción
const API_KEY = process.env.NEXT_PUBLIC_EMAIL_API_KEY || '';
const EMAIL_API_URL = process.env.NEXT_PUBLIC_EMAIL_API_URL || 'https://mail-api.jvserver.com';

/**
 * Envía los datos del formulario de contacto al servidor de correo
 * @param formData Datos del formulario de contacto
 */
export const sendContactForm = async (formData: ContactFormData): Promise<EmailResponse> => {
  try {
    // Preparamos los datos para enviar
    const requestData = {
      clientName: formData.name,
      clientEmail: formData.email,
      subject: formData.subject,
      message: formData.message,
      language: formData.language || 'es'
    };
    
    // Enviamos la solicitud POST
    const response = await fetch(`${EMAIL_API_URL}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY,
        'Accept': 'application/json',
        'Origin': window.location.origin
      },
      body: JSON.stringify(requestData),
      mode: 'cors',
      credentials: 'omit' // Mantener 'omit' para evitar problemas de CORS
    });
    
    // Si la respuesta no es JSON, manejar como texto
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }
    
    if (!response.ok) {
      console.error(`Error al enviar el formulario: ${response.status} ${response.statusText}`, data);
      
      // Si es un error de método no permitido, proporcionar información más específica
      if (response.status === 405) {
        return {
          status: 'error',
          message: 'El servidor no permite este tipo de solicitud. Por favor, contacta al administrador del sitio.',
          errors: ['Método no permitido (405). Asegúrate de que el servidor acepta solicitudes POST.']
        };
      }
      
      return {
        status: 'error',
        message: data.message || `Error ${response.status}: ${response.statusText}`,
        errors: data.errors || []
      };
    }
    
    return {
      status: 'success',
      message: data.message || 'Mensaje enviado correctamente'
    };
  } catch (error) {
    console.error('Error al enviar el formulario:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return {
      status: 'error',
      message: errorMessage
    };
  }
};

/**
 * Verifica el estado del servicio de correo
 * @returns true si el servicio está funcionando, false en caso contrario
 */
export const checkEmailServiceHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${EMAIL_API_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': API_KEY,
        'Origin': window.location.origin
      },
      mode: 'cors',
      credentials: 'omit'
    });
    
    // Manejar respuesta no JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data.status === 'OK' || data.status === 'WARNING';
    }
    
    return response.ok;
  } catch (error) {
    console.error('Error al verificar el estado del servicio de correo:', error);
    return false;
  }
};
