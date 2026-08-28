import { redirect } from "next/navigation"

/** Redirect legacy: `/projects` → `/work`. */
export default function ProjectsPage() {
  redirect("/work")
}
