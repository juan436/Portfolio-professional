import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react"

/**
 * State-machine master-detail de los managers del Admin (lista + panel de
 * detalle/edición + diálogo de borrado). Extraído de `certificates-manager` y
 * `project-stats-manager`, que reimplementaban byte-idéntico este mismo bloque
 * (auditoría 2026-08-27 §4.4). `projects-manager` ya tenía su propia versión con
 * tabs por categoría (`use-projects-actions`) — esa no se toca.
 *
 * El hook NO conoce las Server Actions: `handleSave` / `handleDelete` siguen en
 * cada manager (difieren de verdad — create+update vs upsert, optimista vs
 * recarga completa). El hook aporta el contenedor de estado y las transiciones
 * de selección / nuevo / cancelar / abrir-cerrar diálogo.
 *
 * @typeParam T - Forma del registro.
 * @typeParam D - Lo que identifica al registro a borrar (id `string` por
 *   defecto, o el objeto entero si el `deleteAction` necesita más de un campo).
 */

interface Options<T> {
  list: () => Promise<T[]>
  empty: () => T
}

export interface EntityManager<T, D> {
  items: T[]
  setItems: Dispatch<SetStateAction<T[]>>
  isFetching: boolean
  reload: () => Promise<void>

  selected: T | null
  setSelected: (value: T | null) => void
  formData: T | null
  setFormData: Dispatch<SetStateAction<T | null>>

  editMode: boolean
  setEditMode: Dispatch<SetStateAction<boolean>>
  isNew: boolean
  setIsNew: Dispatch<SetStateAction<boolean>>
  isLoading: boolean
  setIsLoading: Dispatch<SetStateAction<boolean>>

  selectItem: (item: T) => void
  startNew: () => void
  cancelEdit: () => void

  deleteTarget: D | null
  isDeleteOpen: boolean
  askDelete: (target: D) => void
  closeDelete: () => void
}

export function useEntityManager<T, D = string>({ list, empty }: Options<T>): EntityManager<T, D> {
  const [items, setItems] = useState<T[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [selected, setSelected] = useState<T | null>(null)
  const [formData, setFormData] = useState<T | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<D | null>(null)

  const listRef = useRef(list)
  listRef.current = list
  const emptyRef = useRef(empty)
  emptyRef.current = empty

  const reload = useCallback(async () => {
    setIsFetching(true)
    try {
      setItems(await listRef.current())
    } finally {
      setIsFetching(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    setFormData(selected)
  }, [selected])

  const selectItem = useCallback((item: T) => {
    setSelected(item)
    setEditMode(false)
    setIsNew(false)
  }, [])

  const startNew = useCallback(() => {
    setSelected(emptyRef.current())
    setIsNew(true)
    setEditMode(true)
  }, [])

  const cancelEdit = useCallback(() => {
    setEditMode(false)
    setIsNew((wasNew) => {
      if (wasNew) setSelected(null)
      return false
    })
  }, [])

  const askDelete = useCallback((target: D) => {
    setDeleteTarget(target)
  }, [])

  const closeDelete = useCallback(() => {
    setDeleteTarget(null)
  }, [])

  return {
    items,
    setItems,
    isFetching,
    reload,
    selected,
    setSelected,
    formData,
    setFormData,
    editMode,
    setEditMode,
    isNew,
    setIsNew,
    isLoading,
    setIsLoading,
    selectItem,
    startNew,
    cancelEdit,
    deleteTarget,
    isDeleteOpen: deleteTarget !== null,
    askDelete,
    closeDelete,
  }
}
