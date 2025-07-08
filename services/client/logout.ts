import { getApiUrl } from "@/utils/url";

/**
 * Cierra la sesión del usuario eliminando las cookies mediante el endpoint de logout
 * @returns Promise<{success: boolean, message: string}> - Resultado de la operación
 */
export async function logout() {
    try {
      const response = await fetch(`${getApiUrl()}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
  
      if (response.ok) {
        return {
          success: true,
          message: 'Sesión cerrada correctamente'
        };
      } else {
        return {
          success: false,
          message: 'Error al cerrar sesión'
        };
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }
  
  /**
   * Redirige al usuario a la página de login
   */
  export function redirectToLogin() {
    window.location.href = '/admin/login';
  }
  
  /**
   * Redirige al usuario al dashboard
   */
  export function redirectToDashboard() {
    window.location.href = '/admin/dashboard';
  }
  