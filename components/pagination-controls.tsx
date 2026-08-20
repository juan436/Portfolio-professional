"use client"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useLanguage } from "@/hooks/use-language"

/**
 * Paginación compartida por las listas del sitio (proyectos/automatizaciones/agentes/blog/certificados/laboratorio).
 * Recibe: `currentPage`/`totalPages`/`onPageChange`.
 * Produce: `null` si hay 1 página o menos; si no, prev/next + números con "…" cuando hay más de 7 páginas.
 */
interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function getPageList(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | "ellipsis")[] = [1]
  if (current > 3) pages.push("ellipsis")

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push("ellipsis")
  pages.push(total)

  return pages
}

export function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
  const { t } = useLanguage()
  if (totalPages <= 1) return null

  const pages = getPageList(currentPage, totalPages)
  const previousLabel = String(t("common.previous") || "Previous")
  const nextLabel = String(t("common.next") || "Next")

  return (
    <Pagination className="mt-12">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            label={previousLabel}
            onClick={(e) => {
              e.preventDefault()
              if (currentPage > 1) onPageChange(currentPage - 1)
            }}
            className={currentPage === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
          />
        </PaginationItem>

        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink
                href="#"
                isActive={p === currentPage}
                onClick={(e) => {
                  e.preventDefault()
                  onPageChange(p)
                }}
                className="cursor-pointer"
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            label={nextLabel}
            onClick={(e) => {
              e.preventDefault()
              if (currentPage < totalPages) onPageChange(currentPage + 1)
            }}
            className={currentPage === totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
