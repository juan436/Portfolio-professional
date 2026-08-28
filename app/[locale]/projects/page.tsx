import { redirect } from "next/navigation"

/** Redirect legacy: `/[locale]/projects` → `/[locale]/work`. */
export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect(`/${locale}/work`)
}
