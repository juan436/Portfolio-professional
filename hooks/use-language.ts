import { useContext } from 'react';
import { LanguageContext } from '@/contexts/language-context';

/**
 * Hook para acceder al contexto de idioma.
 * Recibe: nada (lee el `LanguageContext`).
 * Produce: `{ language, setLanguage, t }`; lanza si se usa fuera de `LanguageProvider`.
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage debe ser usado dentro de un LanguageProvider");
  }
  return context;
};
