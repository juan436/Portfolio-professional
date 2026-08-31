import { revalidatePath, updateTag } from "next/cache"

/**
 * Helpers de revalidación compartidos entre Server Actions (lib/actions/*.ts).
 * Vive FUERA de cualquier archivo "use server" a propósito: Next exige que
 * todo lo exportado de un módulo "use server" sea una función async — un
 * helper síncrono ahí rompe el build ("Server Actions must be async functions").
 * @param category - Categoría del proyecto guardado/editado.
 * @param id - Id del proyecto, para revalidar también su página de detalle.
 */
export type ProjectCategoryValue = "web" | "mobile" | "infra_backend" | "laboratorio" | "automatizacion" | "agente"

// El carrusel "Casos de Éxito Verificados" del home sale de `Testimonial`
// (status: approved) vía `getApprovedTestimonials` — tag "testimonials" +
// "home". Crear/editar/borrar/aprobar un testimonio tiene que invalidarlo.
export function revalidateHomeTestimonials() {
  updateTag("testimonials")
  updateTag("home")
  revalidatePath("/")
}

export function revalidateForCategory(category: ProjectCategoryValue, id?: string) {
  // Invalida el caché de datos (unstable_cache) además del caché de rutas.
  updateTag("projects")
  updateTag("home") // la home muestra proyectos web/mobile/infra

  switch (category) {
    case "web":
    case "mobile":
    case "infra_backend":
      revalidatePath("/work")
      if (id) revalidatePath(`/projects/${id}`)
      break
    case "laboratorio":
      revalidatePath("/laboratory")
      if (id) revalidatePath(`/laboratory/${id}`)
      break
    case "automatizacion":
      revalidatePath("/work")
      revalidatePath("/automations")
      if (id) revalidatePath(`/automations/${id}`)
      break
    case "agente":
      revalidatePath("/work")
      revalidatePath("/agents")
      if (id) revalidatePath(`/agents/${id}`)
      break
  }
}
