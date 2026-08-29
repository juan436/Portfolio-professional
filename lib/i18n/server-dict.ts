/**
 * Resolución de traducciones server-side (para `generateMetadata`, que no puede
 * usar el hook `useLanguage`). Es un alias de `getTranslator` de `dictionary.ts`
 * — misma función pura que usa el cliente, así el texto es idéntico en los dos
 * lados. `getServerT(locale)("seo.pages.work.title")` → string.
 */
export { getTranslator as getServerT } from "./dictionary"
