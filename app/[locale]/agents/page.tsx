import { redirect } from "next/navigation"

/** Página `/[locale]/agents` (Server Component). El listado completo vive en `/work#agents` (paginado in-place). */
export default async function AgentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect(`/${locale}/work#agents`)
}
