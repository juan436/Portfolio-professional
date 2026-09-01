import { ListPageSkeleton } from "@/components/skeletons/page-skeletons"

/** Skeleton de `/certificates` (header + grilla de 3 columnas). */
export default function Loading() {
  return <ListPageSkeleton cols="md:grid-cols-2 lg:grid-cols-3" count={6} cardClass="h-64" />
}
