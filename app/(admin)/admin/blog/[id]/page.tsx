import { BlogEditorPage } from "@/components/admin/blog/blog-editor-page"

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <BlogEditorPage postId={id} />
}
