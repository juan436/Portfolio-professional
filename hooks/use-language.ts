import { useContext } from 'react';
import { LanguageContext } from '@/contexts/language-context';

/**
 * Hook personalizado para usar el contexto de idioma
 * Proporciona acceso al idioma actual, la función para cambiarlo y la función de traducción
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage debe ser usado dentro de un LanguageProvider");
  }
  return context;
};
