"use client"

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react"
import type { ProjectMatch } from "@/components/contact/project-match-card"
import type { SchedulingData } from "@/components/contact/scheduling-widget"

/**
 * Ciclo de vida de una charla de Jevy (`/contact`): qué mensajes existen,
 * persistencia en localStorage y timers de inactividad. Extraído de
 * `components/contact/jevy-chat.tsx` (auditoría 2026-08-27 §2.3 — era el
 * componente con más estado del sitio, ~30 hooks).
 *
 * El componente conserva el render + `pushLeadLine` (el fetch a la API): este
 * hook NO conoce `/api/contact/chat`, adjuntos, ni `initialService`. Solo sabe
 * de `lines` / `history` / `sessionId` / `isClosed` / `chipsVisible` y de los
 * dos timers (aviso a los 5 min, cierre 30 s después).
 *
 * Comportamiento preservado 1:1 respecto de la versión inline anterior.
 */

const CHAT_STORAGE_KEY = "jevy-chat-state"
// 5 min sin actividad real (mensaje enviado/recibido): se manda un aviso
// automático ("¿sigues ahí?", sin pasar por DeepSeek). Si pasan otros 30s más
// sin actividad después de ese aviso, se cierra la charla y arranca una nueva.
const INACTIVITY_WARNING_MS = 5 * 60 * 1000
const INACTIVITY_CLOSE_MS = 30 * 1000

export interface ChatLine {
  id: number
  role: "jevy" | "lead"
  text: string
  matches?: ProjectMatch[]
  schedulingData?: SchedulingData
}

export interface DeepSeekMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface UseJevyChatSessionOptions {
  /** Saludo inicial ya traducido al idioma activo. */
  greeting: string
  /** Aviso de inactividad ("¿sigues ahí?") ya traducido. */
  areYouThere: string
  /** Idioma activo — una charla guardada en otro idioma se descarta al montar. */
  localeCode: string
  /** Se llama cuando la charla se reinicia sola por inactividad (limpiar input, etc.). */
  onReset?: () => void
}

export interface JevyChatSession {
  lines: ChatLine[]
  setLines: Dispatch<SetStateAction<ChatLine[]>>
  history: DeepSeekMessage[]
  setHistory: Dispatch<SetStateAction<DeepSeekMessage[]>>
  /** Un id por charla — agrupa adjuntos en disco y evita guardar el Lead más de una vez. */
  sessionId: string
  isClosed: boolean
  setIsClosed: Dispatch<SetStateAction<boolean>>
  chipsVisible: boolean
  setChipsVisible: Dispatch<SetStateAction<boolean>>
  /** Reprograma los timers de inactividad — llamar en cada actividad real. */
  scheduleInactivityWarning: () => void
  clearInactivityTimers: () => void
}

export function useJevyChatSession({
  greeting,
  areYouThere,
  localeCode,
  onReset,
}: UseJevyChatSessionOptions): JevyChatSession {
  const [lines, setLines] = useState<ChatLine[]>([])
  const [history, setHistory] = useState<DeepSeekMessage[]>([])
  const [chipsVisible, setChipsVisible] = useState(true)
  const [isClosed, setIsClosed] = useState(false)
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID())

  // Refs para leer el valor más reciente desde dentro de los setTimeout — los
  // closures de scheduleInactivityWarning/resetChat se crean una vez por llamada
  // y si leyeran el estado directo quedarían pegados al valor de ese render
  // (texto vacío antes de que carguen las traducciones, o un isClosed viejo).
  const isClosedRef = useRef(isClosed)
  useEffect(() => {
    isClosedRef.current = isClosed
  }, [isClosed])

  const textsRef = useRef({ greeting, areYouThere })
  useEffect(() => {
    textsRef.current = { greeting, areYouThere }
  }, [greeting, areYouThere])

  const onResetRef = useRef(onReset)
  useEffect(() => {
    onResetRef.current = onReset
  })

  const localeRef = useRef(localeCode)
  useEffect(() => {
    localeRef.current = localeCode
  }, [localeCode])

  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearInactivityTimers = () => {
    if (warnTimerRef.current) {
      clearTimeout(warnTimerRef.current)
      warnTimerRef.current = null
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  // Charla vieja sin actividad: aviso automático (sin pasar por DeepSeek) y, si
  // tampoco hay respuesta 30s después, se cierra y arranca una nueva.
  const resetChat = () => {
    clearInactivityTimers()
    try {
      localStorage.removeItem(CHAT_STORAGE_KEY)
    } catch {
      // localStorage inaccesible — igual arranca de cero en memoria
    }
    setSessionId(crypto.randomUUID())
    setIsClosed(false)
    setChipsVisible(true)
    onResetRef.current?.()
    const nextGreeting = textsRef.current.greeting
    setLines([{ id: 0, role: "jevy", text: nextGreeting }])
    setHistory([{ role: "assistant", content: nextGreeting }])
    scheduleInactivityWarning()
  }

  const scheduleInactivityWarning = () => {
    clearInactivityTimers()
    warnTimerRef.current = setTimeout(() => {
      if (isClosedRef.current) return
      const warningText = textsRef.current.areYouThere
      setLines((prev) => [...prev, { id: prev.length, role: "jevy", text: warningText }])
      setHistory((prev) => [...prev, { role: "assistant", content: warningText }])
      closeTimerRef.current = setTimeout(() => {
        if (isClosedRef.current) return
        resetChat()
      }, INACTIVITY_CLOSE_MS)
    }, INACTIVITY_WARNING_MS)
  }

  useEffect(() => clearInactivityTimers, [])

  // Restaurar la charla completa desde localStorage al montar. `restoredRef` se
  // marca en el mismo tick (síncrono, es un ref) para que el efecto del saludo
  // inicial de abajo NO lo pise: `useTranslatedTexts` es síncrono, así que el
  // saludo ya está listo en el primer render y su efecto correría en el mismo
  // flush que este, antes de que el `setLines(guardado)` se aplique.
  // isFirstSaveRef evita que el efecto de guardado sobreescriba lo recién leído
  // con el estado vacío por defecto de este primer render.
  const isFirstSaveRef = useRef(true)
  const restoredRef = useRef(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHAT_STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        const isStale = typeof saved?.updatedAt !== "number" || Date.now() - saved.updatedAt > INACTIVITY_WARNING_MS
        // Una charla guardada pertenece al idioma en que se creó. Si el visitante
        // está ahora en otro idioma (o la entrada es de un formato viejo sin
        // `locale`), se descarta y arranca de cero en el idioma actual.
        const wrongLocale = saved?.locale !== localeRef.current
        if (isStale || wrongLocale) {
          localStorage.removeItem(CHAT_STORAGE_KEY)
        } else if (saved?.sessionId && Array.isArray(saved.lines) && saved.lines.length > 0) {
          restoredRef.current = true
          setSessionId(saved.sessionId)
          setLines(saved.lines)
          setHistory(Array.isArray(saved.history) ? saved.history : [])
          setIsClosed(Boolean(saved.isClosed))
          setChipsVisible(Boolean(saved.chipsVisible))
          if (!saved.isClosed) scheduleInactivityWarning()
        }
      }
    } catch {
      // localStorage corrupto o inaccesible — arranca de cero, no rompe el chat
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isFirstSaveRef.current) {
      isFirstSaveRef.current = false
      return
    }
    try {
      localStorage.setItem(
        CHAT_STORAGE_KEY,
        JSON.stringify({ sessionId, lines, history, isClosed, chipsVisible, locale: localeRef.current, updatedAt: Date.now() }),
      )
    } catch {
      // localStorage lleno o inaccesible — no rompe el chat
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, lines, history, isClosed, chipsVisible])

  // Arranca la conversación con el saludo — salvo que el efecto de restaurar de
  // arriba ya haya recuperado una charla guardada (restoredRef).
  useEffect(() => {
    if (greeting && lines.length === 0 && !restoredRef.current) {
      setLines([{ id: 0, role: "jevy", text: greeting }])
      setHistory([{ role: "assistant", content: greeting }])
      scheduleInactivityWarning()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [greeting])

  // Si el idioma cambia ANTES de que el lead escriba nada, re-pintar el saludo
  // en el idioma nuevo — lines[0] se guarda como string literal (estado +
  // localStorage), un t() no lo re-traduce solo. Una vez que arrancó la charla
  // (lines.length > 1), lo viejo queda como está.
  useEffect(() => {
    if (!greeting) return
    setLines((prev) =>
      prev.length === 1 && prev[0].role === "jevy" && prev[0].text !== greeting
        ? [{ ...prev[0], text: greeting }]
        : prev,
    )
    setHistory((prev) =>
      prev.length === 1 && prev[0].role === "assistant" && prev[0].content !== greeting
        ? [{ role: "assistant", content: greeting }]
        : prev,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [greeting])

  return {
    lines,
    setLines,
    history,
    setHistory,
    sessionId,
    isClosed,
    setIsClosed,
    chipsVisible,
    setChipsVisible,
    scheduleInactivityWarning,
    clearInactivityTimers,
  }
}
