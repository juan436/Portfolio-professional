import { ListPageSkeleton } from "@/components/skeletons/page-skeletons"

/** Skeleton de `/automations` (header + grilla de cards). */
export default function Loading() {
  return <ListPageSkeleton cols="md:grid-cols-2" count={4} cardClass="h-72" />
}
