"use client"

import { useCallback, useEffect, useReducer, useRef } from "react"
import type { ProjectMatch } from "@/components/contact/project-match-card"
import type { SchedulingData } from "@/components/contact/scheduling-widget"

/**
 * Ciclo de vida de una charla de Jevy (`/contact`): qué mensajes existen,
 * persistencia en localStorage y timers de inactividad. Extraído de
 * `components/contact/jevy-chat.tsx` (auditoría 2026-08-27 §2.3 — era el
 * componente con más estado del sitio).
 *
 * El estado de la charla es un `useReducer`: cada transición tiene nombre y la
 * regla de "cuando pasa X, estos campos cambian juntos" vive solo en el
 * reducer. El componente conserva el render + `pushLeadLine` (el fetch a la
 * API): este hook NO conoce `/api/contact/chat`, adjuntos ni `initialService`.
 *
 * Notas de arquitectura:
 * - Cambiar de idioma remonta este componente (navega a `/[locale]/contact`),
 *   así que `greeting` es constante durante la vida del hook — no hace falta
 *   re-traducir el saludo en vivo.
 * - Los `setTimeout` de inactividad no pueden leer estado de React; para eso
 *   quedan tres refs espejo (`isClosedRef` / `textsRef` / `onResetRef`). El
 *   resto de refs son de coordinación de efectos o handles de timer.
 */

const CHAT_STORAGE_KEY = "jevy-chat-state"
// 5 min sin actividad real (mensaje enviado/recibido): aviso automático
// ("¿sigues ahí?", sin pasar por DeepSeek). Si pasan otros 30s más sin
// actividad, se cierra la charla y arranca una nueva.
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

interface SessionState {
  lines: ChatLine[]
  history: DeepSeekMessage[]
  chipsVisible: boolean
  isClosed: boolean
  /** Un id por charla — agrupa adjuntos en disco y evita guardar el Lead más de una vez. */
  sessionId: string
}

interface JevyLinePayload {
  text: string
  matches?: ProjectMatch[]
  schedulingData?: SchedulingData
  /** El server decidió cerrar la charla (agenda confirmada, etc.). */
  closed?: boolean
}

type SessionAction =
  | { type: "restore"; state: SessionState }
  | { type: "bootstrap"; greeting: string }
  | { type: "leadLine"; text: string }
  | ({ type: "jevyLine" } & JevyLinePayload)
  | { type: "jevyError"; text: string }
  | { type: "inactivityWarning"; text: string }
  | { type: "resetForInactivity"; greeting: string }

function initialState(): SessionState {
  return { lines: [], history: [], chipsVisible: true, isClosed: false, sessionId: crypto.randomUUID() }
}

function greetingState(greeting: string, base: SessionState): SessionState {
  return {
    ...base,
    lines: [{ id: 0, role: "jevy", text: greeting }],
    history: [{ role: "assistant", content: greeting }],
  }
}

function reducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case "restore":
      return action.state

    case "bootstrap":
      return greetingState(action.greeting, state)

    case "leadLine":
      return {
        ...state,
        lines: [...state.lines, { id: state.lines.length, role: "lead", text: action.text }],
        history: [...state.history, { role: "user", content: action.text }],
        chipsVisible: false,
      }

    case "jevyLine":
      return {
        ...state,
        lines: [
          ...state.lines,
          {
            id: state.lines.length,
            role: "jevy",
            text: action.text,
            matches: action.matches,
            schedulingData: action.schedulingData,
          },
        ],
        history: [...state.history, { role: "assistant", content: action.text }],
        isClosed: action.closed ? true : state.isClosed,
      }

    // El fallback de error se ve pero NO entra al historial de DeepSeek — así el
    // modelo no "recuerda" un turno que en realidad falló.
    case "jevyError":
      return {
        ...state,
        lines: [...state.lines, { id: state.lines.length, role: "jevy", text: action.text }],
      }

    case "inactivityWarning":
      if (state.isClosed) return state
      return {
        ...state,
        lines: [...state.lines, { id: state.lines.length, role: "jevy", text: action.text }],
        history: [...state.history, { role: "assistant", content: action.text }],
      }

    case "resetForInactivity":
      return greetingState(action.greeting, {
        ...initialState(),
        sessionId: crypto.randomUUID(),
      })
  }
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
  history: DeepSeekMessage[]
  sessionId: string
  isClosed: boolean
  chipsVisible: boolean
  /** El lead mandó un mensaje: se agrega la línea + al historial, se ocultan los chips. */
  sendLeadLine: (text: string) => void
  /** Llegó la respuesta de Jevy (con matches / widget de agenda / cierre opcionales). */
  receiveJevyLine: (payload: JevyLinePayload) => void
  /** El fetch falló: se muestra el fallback sin tocar el historial. */
  receiveJevyError: (text: string) => void
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
  const [state, dispatch] = useReducer(reducer, undefined, initialState)

  // Refs espejo para los `setTimeout` (no pueden leer estado de React).
  const isClosedRef = useRef(state.isClosed)
  useEffect(() => {
    isClosedRef.current = state.isClosed
  }, [state.isClosed])

  const textsRef = useRef({ greeting, areYouThere })
  useEffect(() => {
    textsRef.current = { greeting, areYouThere }
  }, [greeting, areYouThere])

  const onResetRef = useRef(onReset)
  useEffect(() => {
    onResetRef.current = onReset
  })

  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearInactivityTimers = useCallback(() => {
    if (warnTimerRef.current) {
      clearTimeout(warnTimerRef.current)
      warnTimerRef.current = null
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  const scheduleInactivityWarning = useCallback(() => {
    clearInactivityTimers()
    warnTimerRef.current = setTimeout(() => {
      if (isClosedRef.current) return
      dispatch({ type: "inactivityWarning", text: textsRef.current.areYouThere })
      closeTimerRef.current = setTimeout(() => {
        if (isClosedRef.current) return
        clearInactivityTimers()
        try {
          localStorage.removeItem(CHAT_STORAGE_KEY)
        } catch {
          // localStorage inaccesible — igual arranca de cero en memoria
        }
        dispatch({ type: "resetForInactivity", greeting: textsRef.current.greeting })
        onResetRef.current?.()
        scheduleInactivityWarning()
      }, INACTIVITY_CLOSE_MS)
    }, INACTIVITY_WARNING_MS)
  }, [clearInactivityTimers])

  useEffect(() => clearInactivityTimers, [clearInactivityTimers])

  // --- Persistencia -------------------------------------------------------
  // `restoredRef`: si el efecto de restaurar recuperó una charla, el de saludo
  // no debe pisarla. `useTranslatedTexts` es síncrono → el saludo ya está en el
  // primer render y su efecto correría en el mismo flush que el de restaurar,
  // antes de que el dispatch se aplique. `isFirstSaveRef` evita que el efecto
  // de guardado sobreescriba lo recién leído con el estado inicial vacío.
  const restoredRef = useRef(false)
  const isFirstSaveRef = useRef(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHAT_STORAGE_KEY)
      if (!raw) return
      const saved = JSON.parse(raw)
      const isStale = typeof saved?.updatedAt !== "number" || Date.now() - saved.updatedAt > INACTIVITY_WARNING_MS
      // Una charla guardada pertenece al idioma en que se creó. Si el visitante
      // está en otro idioma (o es un formato viejo sin `locale`), se descarta.
      const wrongLocale = saved?.locale !== localeCode
      if (isStale || wrongLocale) {
        localStorage.removeItem(CHAT_STORAGE_KEY)
        return
      }
      if (saved?.sessionId && Array.isArray(saved.lines) && saved.lines.length > 0) {
        restoredRef.current = true
        dispatch({
          type: "restore",
          state: {
            lines: saved.lines,
            history: Array.isArray(saved.history) ? saved.history : [],
            isClosed: Boolean(saved.isClosed),
            chipsVisible: Boolean(saved.chipsVisible),
            sessionId: saved.sessionId,
          },
        })
        if (!saved.isClosed) scheduleInactivityWarning()
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
        JSON.stringify({ ...state, locale: localeCode, updatedAt: Date.now() }),
      )
    } catch {
      // localStorage lleno o inaccesible — no rompe el chat
    }
  }, [state, localeCode])

  // Arranca la conversación con el saludo — salvo que ya se haya restaurado una
  // charla guardada (restoredRef).
  useEffect(() => {
    if (greeting && state.lines.length === 0 && !restoredRef.current) {
      dispatch({ type: "bootstrap", greeting })
      scheduleInactivityWarning()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [greeting])

  const sendLeadLine = useCallback((text: string) => dispatch({ type: "leadLine", text }), [])
  const receiveJevyLine = useCallback(
    (payload: JevyLinePayload) => dispatch({ type: "jevyLine", ...payload }),
    [],
  )
  const receiveJevyError = useCallback((text: string) => dispatch({ type: "jevyError", text }), [])

  return {
    lines: state.lines,
    history: state.history,
    sessionId: state.sessionId,
    isClosed: state.isClosed,
    chipsVisible: state.chipsVisible,
    sendLeadLine,
    receiveJevyLine,
    receiveJevyError,
    scheduleInactivityWarning,
    clearInactivityTimers,
  }
}
