import { redirect } from "next/navigation"

/** Redirect legacy: `/projects/fullstack` → `/work`. */
export default function FullStackProjectsPage() {
  redirect("/work")
}
