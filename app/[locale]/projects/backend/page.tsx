import { redirect } from "next/navigation"

/** Redirect legacy: `/[locale]/projects/backend` → `/[locale]/work`. */
export default async function BackendProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect(`/${locale}/work`)
}
