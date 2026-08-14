"use client"

import { useEffect, useState } from "react"
import { Loader2, Calendar, Check, AlertCircle } from "lucide-react"

export interface SchedulingData {
  name: string
  email: string
  type: "client" | "recruiter"
  preferredChannel: "email" | "whatsapp"
  channelContact: string
  problem: string
  whatTheyWant: string
  estimatedAmount: string
  expectedTimeline: string
  projectMatch: string
  interestLevel: "high" | "medium" | "low"
  transcript: string
}

interface Slot {
  startISO: string
  endISO: string
  label: string
}

type Status = "loading" | "picking" | "booking" | "success" | "conflict" | "failed" | "unavailable"

interface SchedulingWidgetProps {
  schedulingData: SchedulingData
  texts: {
    loadingSlots: string
    pickSlot: string
    confirming: string
    successTitle: string
    successBody: string
    conflict: string
    failed: string
    unavailable: string
  }
}

export function SchedulingWidget({ schedulingData, texts }: SchedulingWidgetProps) {
  const [status, setStatus] = useState<Status>("loading")
  const [slots, setSlots] = useState<Slot[]>([])
  const [meetLink, setMeetLink] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const fetchSlots = async () => {
    setStatus("loading")
    try {
      const response = await fetch("/api/contact/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "availability" }),
      })
      const data = await response.json()
      if (!response.ok || !Array.isArray(data.slots)) {
        setStatus("unavailable")
        return
      }
      setSlots(data.slots)
      setStatus("picking")
    } catch {
      setStatus("unavailable")
    }
  }

  useEffect(() => {
    fetchSlots()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pickSlot = async (slot: Slot) => {
    setStatus("booking")
    try {
      const response = await fetch("/api/contact/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "book", ...schedulingData, startISO: slot.startISO, endISO: slot.endISO }),
      })
      const data = await response.json()

      if (response.ok && data.success) {
        setMeetLink(data.meetLink || null)
        setStatus("success")
        return
      }

      if (response.status === 409) {
        setMessage(data.message || null)
        setStatus("conflict")
        await fetchSlots()
        return
      }

      setMessage(data.message || null)
      setStatus("failed")
    } catch {
      setStatus("failed")
    }
  }

  if (status === "loading" || status === "booking") {
    return (
      <div className="mt-2 flex items-center gap-2 text-slate-400 text-sm font-mono">
        <Loader2 className="h-4 w-4 animate-spin" />
        {status === "booking" ? texts.confirming : texts.loadingSlots}
      </div>
    )
  }

  if (status === "unavailable") {
    return (
      <div className="mt-2 flex items-center gap-2 text-amber-400 text-sm font-mono">
        <AlertCircle className="h-4 w-4" />
        {texts.unavailable}
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="mt-2 max-w-sm rounded-lg border border-green-700/30 bg-black/40 p-4 not-italic font-sans">
        <div className="flex items-center gap-2 text-green-400 font-semibold text-sm mb-1">
          <Check className="h-4 w-4" />
          {texts.successTitle}
        </div>
        <p className="text-sm text-slate-300">{texts.successBody}</p>
        {meetLink && (
          <a
            href={meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-xs px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            Google Meet
          </a>
        )}
      </div>
    )
  }

  if (status === "failed") {
    return (
      <div className="mt-2 flex items-start gap-2 text-amber-400 text-sm font-sans not-italic max-w-sm">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <span>{message || texts.failed}</span>
      </div>
    )
  }

  // picking / conflict (con slots ya refrescados)
  return (
    <div className="mt-2 max-w-sm not-italic font-sans">
      {status === "conflict" && (
        <p className="text-amber-400 text-xs mb-2 flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5" />
          {message || texts.conflict}
        </p>
      )}
      <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-2">
        <Calendar className="h-3.5 w-3.5" />
        {texts.pickSlot}
      </div>
      <div className="flex flex-wrap gap-2">
        {slots.map((slot) => (
          <button
            key={slot.startISO}
            onClick={() => pickSlot(slot)}
            className="text-xs px-3 py-1.5 rounded-md border border-blue-700/30 text-slate-300 hover:border-blue-500/50 hover:text-blue-400 transition-colors"
          >
            {slot.label}
          </button>
        ))}
      </div>
    </div>
  )
}
