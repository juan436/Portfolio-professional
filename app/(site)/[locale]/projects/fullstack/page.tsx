import { redirect } from "next/navigation"

export default async function FullStackProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect(`/${locale}/work`)
}
