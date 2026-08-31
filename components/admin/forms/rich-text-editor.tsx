"use client"

import { useEffect, useRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TextAlign from "@tiptap/extension-text-align"
import Highlight from "@tiptap/extension-highlight"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { createLowlight, common } from "lowlight"
import { ResizableImage } from "@/components/admin/forms/resizable-image"
import { LineSpacing, LINE_SPACING_OPTIONS } from "@/components/admin/forms/line-spacing-extension"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalSpaceAround,
  List,
  ListOrdered,
  Quote,
  Code2,
  Minus,
  Highlighter,
  Link2,
  Link2Off,
  ImageIcon,
  Loader2,
  Smile,
  ChevronDown,
} from "lucide-react"
import { useMediaActions } from "@/hooks/admin/entities/media/use-media-actions"

/**
 * Editor rich text (Tiptap) del Admin — reemplaza `WorkProcessEditor` para
 * `BlogPost.body`. Guarda/recibe HTML plano (`value`/`onChange`).
 * Recibe: `value` (HTML), `onChange(html)`, `disabled`, `label`.
 * Produce: toolbar + área editable, mismo contrato de props que TextAreaField/WorkProcessEditor.
 */
const EMOJIS = [
  "😀", "😂", "😉", "😍", "🤔", "😅", "👀", "🙌", "👏", "💪",
  "🔥", "✨", "⚡", "🚀", "🎯", "🎉", "💡", "📌", "📝", "📊",
  "🧠", "🤖", "🛠️", "🔍", "🔗", "✅", "❌", "⚠️", "💬", "➡️",
]

const CODE_LANGUAGES = [
  { value: "plaintext", label: "Texto plano" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "bash", label: "Bash" },
  { value: "json", label: "JSON" },
  { value: "sql", label: "SQL" },
  { value: "yaml", label: "YAML" },
  { value: "xml", label: "HTML / XML" },
  { value: "css", label: "CSS" },
  { value: "markdown", label: "Markdown" },
]

const lowlight = createLowlight(common)

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  children: React.ReactNode
  title: string
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`h-8 w-8 ${active ? "bg-blue-700/30 text-blue-400" : "text-slate-400 hover:text-white"}`}
    >
      {children}
    </Button>
  )
}

export function RichTextEditor({
  label,
  value,
  onChange,
  disabled,
}: {
  label?: string
  value: string | undefined
  onChange: (html: string) => void
  disabled?: boolean
}) {
  const { state: uploadState, uploadImage } = useMediaActions()
  const imageInputRef = useRef<HTMLInputElement>(null)
  const isUploadingImage = uploadState.status === "uploading" || uploadState.status === "confirming"

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight, defaultLanguage: "plaintext" }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight,
      ResizableImage,
      LineSpacing,
    ],
    content: value || "",
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "blog-content text-[18px] min-h-[480px] focus:outline-none",
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    editor.setEditable(!disabled)
  }, [editor, disabled])

  useEffect(() => {
    if (!editor) return
    if (value !== editor.getHTML()) editor.commands.setContent(value || "", { emitUpdate: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, value])

  const setLink = () => {
    if (!editor) return
    const previous = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("URL del enlace", previous || "https://")
    if (url === null) return
    if (url === "") {
      editor.chain().focus().unsetLink().run()
      return
    }
    editor.chain().focus().setLink({ href: url }).run()
  }

  const insertImage = async (file: File) => {
    if (!editor) return
    try {
      const url = await uploadImage(file)
      editor.chain().focus().setImage({ src: url }).run()
    } catch {
    }
  }

  const setBlockLineSpacing = (value: string | null) => {
    if (!editor) return
    const nodeType = editor.state.selection.$from.parent.type.name
    if (!["paragraph", "heading", "blockquote"].includes(nodeType)) return
    editor.chain().focus().updateAttributes(nodeType, { lineSpacing: value }).run()
  }

  if (!editor) return null

  const currentLineSpacing = editor.getAttributes("paragraph").lineSpacing ?? editor.getAttributes("heading").lineSpacing ?? null

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div>
        {!disabled && (
          <div className="flex flex-wrap items-center gap-0.5 pb-3 mb-6 border-b border-blue-700/20">
            <ToolbarButton title="Negrita" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Cursiva" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Subrayado" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
              <UnderlineIcon className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Tachado" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
              <Strikethrough className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Resaltar" active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()}>
              <Highlighter className="h-4 w-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="h-5 mx-1 bg-blue-700/20" />

            <ToolbarButton title="Título 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
              <Heading1 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Título 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Título 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
              <Heading3 className="h-4 w-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="h-5 mx-1 bg-blue-700/20" />

            <ToolbarButton title="Alinear a la izquierda" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
              <AlignLeft className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Centrar" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
              <AlignCenter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Alinear a la derecha" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
              <AlignRight className="h-4 w-4" />
            </ToolbarButton>

            <Popover>
              <PopoverTrigger asChild>
                <span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title="Interlineado del párrafo"
                    onMouseDown={(e) => e.preventDefault()}
                    className="h-8 w-auto px-1.5 gap-0.5 text-slate-400 hover:text-white"
                  >
                    <AlignVerticalSpaceAround className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </span>
              </PopoverTrigger>
              <PopoverContent className="w-40 bg-black border-blue-700/20 p-1">
                {LINE_SPACING_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setBlockLineSpacing(opt.value)}
                    className={`w-full text-left text-sm px-2.5 py-1.5 rounded-md ${
                      currentLineSpacing === opt.value ? "bg-blue-700/30 text-blue-400" : "text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            <Separator orientation="vertical" className="h-5 mx-1 bg-blue-700/20" />

            <ToolbarButton title="Lista" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Lista numerada" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Cita" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
              <Quote className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton title="Bloque de código" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
              <Code2 className="h-4 w-4" />
            </ToolbarButton>
            {editor.isActive("codeBlock") && (
              <select
                title="Lenguaje del bloque de código"
                value={(editor.getAttributes("codeBlock").language as string) || "plaintext"}
                onChange={(e) => editor.chain().focus().updateAttributes("codeBlock", { language: e.target.value }).run()}
                className="h-8 rounded-md bg-black border border-blue-700/30 text-slate-300 text-xs px-1.5 focus:outline-none"
              >
                {CODE_LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            )}
            <ToolbarButton title="Línea divisoria" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
              <Minus className="h-4 w-4" />
            </ToolbarButton>

            <Separator orientation="vertical" className="h-5 mx-1 bg-blue-700/20" />

            <ToolbarButton title="Enlace" active={editor.isActive("link")} onClick={setLink}>
              <Link2 className="h-4 w-4" />
            </ToolbarButton>
            {editor.isActive("link") && (
              <ToolbarButton title="Quitar enlace" onClick={() => editor.chain().focus().unsetLink().run()}>
                <Link2Off className="h-4 w-4" />
              </ToolbarButton>
            )}
            <ToolbarButton title="Insertar imagen" disabled={isUploadingImage} onClick={() => imageInputRef.current?.click()}>
              {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
            </ToolbarButton>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) insertImage(file)
                e.target.value = ""
              }}
            />

            <Popover>
              <PopoverTrigger asChild>
                <span>
                  <ToolbarButton title="Insertar emoji" onClick={() => {}}>
                    <Smile className="h-4 w-4" />
                  </ToolbarButton>
                </span>
              </PopoverTrigger>
              <PopoverContent className="w-64 bg-black border-blue-700/20 p-2">
                <div className="grid grid-cols-8 gap-1">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => editor.chain().focus().insertContent(emoji).run()}
                      className="h-7 w-7 flex items-center justify-center rounded hover:bg-blue-700/20 text-base"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
