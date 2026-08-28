import { redirect } from "next/navigation"

/** Página `/agents` (Server Component). El listado completo ahora vive en `/work#agents` (paginado in-place). */
export default function AgentsPage() {
  redirect("/work#agents")
}
