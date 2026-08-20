import { useContext } from 'react';
import ContentContext from './content-context';

/**
 * Hook para acceder al contexto de contenido.
 * Recibe: nada (lee el `ContentContext` del árbol de componentes).
 * Produce: `{ content, isLoading, hydrateContent, hydratePartial }`; lanza si se usa fuera de `ContentProvider`.
 */
export const useContent = () => {
  const context = useContext(ContentContext);
  
  if (context === undefined) {
    throw new Error('useContent debe ser usado dentro de un ContentProvider');
  }
  
  return context;
};
