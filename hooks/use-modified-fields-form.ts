"use client"

import { useState, useEffect, type ChangeEvent } from "react"

/**
 * Reemplaza el patrón repetido en los forms simples de Admin (hero/about/
 * contact): estado local + lista de campos modificados + reset al cambiar
 * `content` + handleChange con el mismo dedup. Mismo comportamiento exacto
 * que tenía cada form por separado.
 * @param content - Contenido inicial/actual del form.
 * @param onChange - Callback disparado en cada cambio con el contenido actualizado y `_modifiedFields`.
 * @returns `{ localContent, handleChange }`.
 */
export function useModifiedFieldsForm<T extends { _modifiedFields?: string[] }>(
  content: T,
  onChange: (content: T) => void
) {
  const [modifiedFields, setModifiedFields] = useState<string[]>([])
  const [localContent, setLocalContent] = useState<T>({ ...content })

  useEffect(() => {
    setLocalContent({ ...content })
    setModifiedFields([])
  }, [content])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    setLocalContent((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (!modifiedFields.includes(name)) {
      setModifiedFields((prev) => [...prev, name])
    }

    onChange({
      ...localContent,
      [name]: value,
      _modifiedFields: [...modifiedFields, name].filter((v, i, a) => a.indexOf(v) === i),
    })
  }

  return { localContent, handleChange }
}
