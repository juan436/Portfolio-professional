import { getApiUrl } from '@/utils/url';

export const API_URL = getApiUrl();

// Re-exportar todas las funciones de los módulos específicos
export * from './projects';
export * from './content';
export * from './experience';
export * from './skills';
