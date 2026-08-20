export const dynamic = 'force-dynamic';

/**
 * Layout de `/admin/*` — fuerza render dinámico (Admin siempre necesita el
 * dato más fresco, nunca caché estático) y no agrega chrome propio.
 * Recibe: `children`.
 * Produce: `children` sin envoltorio visual.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
