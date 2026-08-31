export const dynamic = 'force-dynamic';

import { getHomeContent } from "@/lib/data/home-content";
import { ContentHydrator } from "@/components/content-hydrator";

/**
 * Layout de `/admin/*` — fuerza render dinámico (Admin siempre necesita el dato
 * más fresco) y no agrega chrome propio. Hidrata el contenido para el preview
 * de imágenes (`image-manager`, único consumidor de `useContent` en Admin).
 * Recibe: `children`.
 * Produce: `children` sin envoltorio visual.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const content = await getHomeContent();
  return (
    <>
      <ContentHydrator full={content} />
      {children}
    </>
  );
}
