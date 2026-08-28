import { redirect } from "next/navigation"

/** Redirect legacy: `/projects/backend` → `/work`. */
export default function BackendProjectsPage() {
  redirect("/work")
}
