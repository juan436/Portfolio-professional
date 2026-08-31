"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Trash2, Plus } from "lucide-react"

/**
 * Piezas reutilizables del formulario de Proyecto (auditoría 2026-08-19: el
 * form viejo solo cubría 6 de ~25 campos del modelo real). Cada una es
 * deliberadamente simple (sin drag-and-drop, sin editor rico) — funcional
 * y completa, no una reconstrucción de UI de lujo.
 * Recibe (por pieza): `StringListField`/`TextField`/`TextAreaField` → label+value+onChange;
 * `PairListEditor` → array de objetos con 2 campos de texto; `WorkProcessEditor` → bloques `{kind, text, items}`.
 * Produce: el control controlado correspondiente; todas llaman `onChange` con el valor nuevo completo.
 */
export function StringListField({
  label,
  values,
  onChange,
  disabled,
  placeholder,
}: {
  label: string
  values: string[] | undefined
  onChange: (next: string[]) => void
  disabled?: boolean
  placeholder?: string
}) {
  const [draft, setDraft] = useState("")
  const list = values || []

  const add = () => {
    const v = draft.trim()
    if (!v || list.includes(v)) return
    onChange([...list, v])
    setDraft("")
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 mb-1">
        {list.map((item, i) => (
          <div key={i} className="bg-blue-700/20 text-blue-400 px-2 py-1 rounded-md text-sm flex items-center">
            {item}
            {!disabled && (
              <button type="button" onClick={() => onChange(list.filter((_, idx) => idx !== i))} className="ml-2 text-blue-400 hover:text-red-500">
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
        {list.length === 0 && <div className="text-gray-500 text-sm italic">Vacío</div>}
      </div>
      {!disabled && (
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder || "Agregar y presionar Enter"}
            className="bg-black/40 border-blue-700/20"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                add()
              }
            }}
          />
          <Button type="button" onClick={add} variant="outline" size="icon" className="border-blue-700/50 text-blue-500">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

export function TextField({
  label,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  label: string
  value: string | undefined
  onChange: (v: string) => void
  disabled?: boolean
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="bg-black/40 border-blue-700/20"
      />
    </div>
  )
}

export function TextAreaField({
  label,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  label: string
  value: string | undefined
  onChange: (v: string) => void
  disabled?: boolean
  placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="min-h-[80px] bg-black/40 border-blue-700/20"
      />
    </div>
  )
}

interface PairRow {
  [key: string]: string
}

export function PairListEditor<T extends PairRow>({
  label,
  rows,
  onChange,
  disabled,
  fieldA,
  fieldB,
  labelA,
  labelB,
  makeEmpty,
  iconField,
  iconLabel,
}: {
  label: string
  rows: T[] | undefined
  onChange: (next: T[]) => void
  disabled?: boolean
  fieldA: keyof T
  fieldB: keyof T
  labelA: string
  labelB: string
  makeEmpty: () => T
  iconField?: keyof T
  iconLabel?: string
}) {
  const list = rows || []

  const update = (index: number, key: keyof T, value: string) => {
    const next = [...list]
    next[index] = { ...next[index], [key]: value }
    onChange(next)
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-3">
        {list.map((row, i) => (
          <div key={i} className="p-3 rounded-md border border-blue-700/20 bg-black/20 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">#{i + 1}</span>
              {!disabled && (
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => onChange(list.filter((_, idx) => idx !== i))}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            {iconField && (
              <Input
                value={(row[iconField] as string) || ""}
                onChange={(e) => update(i, iconField, e.target.value)}
                disabled={disabled}
                placeholder={iconLabel}
                className="bg-black/40 border-blue-700/20 text-xs"
              />
            )}
            <Input
              value={(row[fieldA] as string) || ""}
              onChange={(e) => update(i, fieldA, e.target.value)}
              disabled={disabled}
              placeholder={labelA}
              className="bg-black/40 border-blue-700/20"
            />
            <Textarea
              value={(row[fieldB] as string) || ""}
              onChange={(e) => update(i, fieldB, e.target.value)}
              disabled={disabled}
              placeholder={labelB}
              className="min-h-[60px] bg-black/40 border-blue-700/20"
            />
          </div>
        ))}
      </div>
      {!disabled && (
        <Button type="button" variant="outline" size="sm" className="border-blue-700/50 text-blue-500" onClick={() => onChange([...list, makeEmpty()])}>
          <Plus className="mr-2 h-3.5 w-3.5" />
          Agregar
        </Button>
      )}
    </div>
  )
}

interface WorkBlock {
  kind: "paragraph" | "steps"
  text?: string
  items?: string[]
}

export function WorkProcessEditor({
  label,
  blocks,
  onChange,
  disabled,
}: {
  label: string
  blocks: WorkBlock[] | undefined
  onChange: (next: WorkBlock[]) => void
  disabled?: boolean
}) {
  const list = blocks || []

  const update = (index: number, patch: Partial<WorkBlock>) => {
    const next = [...list]
    next[index] = { ...next[index], ...patch }
    onChange(next)
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-3">
        {list.map((block, i) => (
          <div key={i} className="p-3 rounded-md border border-blue-700/20 bg-black/20 space-y-2">
            <div className="flex justify-between items-center gap-2">
              <select
                value={block.kind}
                disabled={disabled}
                onChange={(e) => update(i, { kind: e.target.value as WorkBlock["kind"] })}
                className="bg-black/40 border border-blue-700/20 rounded-md text-sm px-2 py-1.5 text-white"
              >
                <option value="paragraph">Párrafo</option>
                <option value="steps">Pasos</option>
              </select>
              {!disabled && (
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => onChange(list.filter((_, idx) => idx !== i))}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            {block.kind === "paragraph" ? (
              <Textarea
                value={block.text || ""}
                onChange={(e) => update(i, { text: e.target.value })}
                disabled={disabled}
                placeholder="Texto del párrafo"
                className="min-h-[60px] bg-black/40 border-blue-700/20"
              />
            ) : (
              <StringListField
                label="Pasos"
                values={block.items}
                onChange={(items) => update(i, { items })}
                disabled={disabled}
                placeholder="Agregar paso"
              />
            )}
          </div>
        ))}
      </div>
      {!disabled && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-blue-700/50 text-blue-500"
          onClick={() => onChange([...list, { kind: "paragraph", text: "" }])}
        >
          <Plus className="mr-2 h-3.5 w-3.5" />
          Agregar bloque
        </Button>
      )}
    </div>
  )
}
