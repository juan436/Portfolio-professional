/**
 * Utilidades para manejo de URLs en diferentes entornos
 */

export const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'https://jevy.dev';
};

export const getApiUrl = (): string => {
  return `${getBaseUrl()}/api`;
};
