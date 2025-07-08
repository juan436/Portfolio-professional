/**
 * Utilidades para manejo de URLs en diferentes entornos
 */

/**
 * Determina la URL base para las llamadas API según el entorno
 * @returns URL base (sin /api al final)
 */
export const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    // En el navegador, usa la URL actual
    return window.location.origin;
  }
  // En el servidor, usa la variable de entorno o un valor por defecto
  return process.env.NEXT_PUBLIC_API_URL || 'https://jvillegas-portafolio.jvserver.com';
};

/**
 * Obtiene la URL completa de la API
 * @returns URL completa de la API con /api al final
 */
export const getApiUrl = (): string => {
  return `${getBaseUrl()}/api`;
};
