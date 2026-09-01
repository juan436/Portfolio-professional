import { redirect } from "next/navigation"

/** Redirect legacy: `/[locale]/projects/fullstack` → `/[locale]/work`. */
export default async function FullStackProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect(`/${locale}/work`)
}
