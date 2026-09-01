import { ListPageSkeleton } from "@/components/skeletons/page-skeletons"

export default function Loading() {
  return <ListPageSkeleton cols="md:grid-cols-2 lg:grid-cols-3" count={6} cardClass="h-64" />
}
