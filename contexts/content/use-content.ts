import { useContext } from 'react';
import ContentContext from './content-context';

/**
 * Hook personalizado para acceder al contexto de contenido
 * Proporciona acceso al contenido actual y a las funciones para modificarlo
 */
export const useContent = () => {
  const context = useContext(ContentContext);
  
  if (context === undefined) {
    throw new Error('useContent debe ser usado dentro de un ContentProvider');
  }
  
  return context;
};
