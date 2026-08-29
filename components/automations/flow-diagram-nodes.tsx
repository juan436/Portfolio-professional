import { Handle, Position, type NodeProps } from "@xyflow/react"
import { Check, Send, Sparkles, Cog, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

/**
 * Nodos de React Flow del `FlowDiagram` (trigger / step / resultado).
 * Islas sin estado: cada uno recibe su `data` ya calculado por el orquestador.
 * Extraídos de `flow-diagram.tsx` en la auditoría 2026-08-27 §3.
 */

export type TriggerData = {
  label: string
  mode: "text" | "file"
  fileLabel: string
  value: string
  disabled: boolean
  placeholder: string
  sendLabel: string
  onChange: (value: string) => void
  onSubmit: () => void
}

export type StepData = {
  label: string
  index: number
  state: "pending" | "active" | "done"
}

export type OutputData = {
  label: string
  output: string
}

const handleDot = "!w-3 !h-3 !bg-blue-500 !border-2 !border-black"

function TriggerNode({ data }: NodeProps & { data: TriggerData }) {
  return (
    <div className="w-[310px] rounded-3xl border-2 border-blue-500 bg-gradient-to-br from-blue-500/25 via-zinc-900 to-zinc-900 shadow-xl shadow-blue-500/20 backdrop-blur-sm p-4">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-xl bg-blue-500/25 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4.5 h-4.5 text-blue-300" />
        </div>
        <span className="text-[11px] uppercase tracking-wider text-blue-300 font-bold leading-tight">
          {data.label}
        </span>
      </div>
      {data.mode === "file" ? (
        <div className="flex items-center gap-2.5 h-9 px-3 rounded-md bg-white/5 border border-white/10">
          <FileText className="h-4 w-4 text-blue-300 flex-shrink-0" />
          <span className="text-sm text-slate-200 truncate">{data.fileLabel}</span>
          <Check className="h-3.5 w-3.5 text-blue-400 ml-auto flex-shrink-0" />
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            value={data.value}
            onChange={(e) => data.onChange(e.target.value)}
            placeholder={data.placeholder}
            disabled={data.disabled}
            onKeyDown={(e) => e.key === "Enter" && data.onSubmit()}
            className="h-9 flex-1 min-w-0 text-sm bg-white/5 border-white/10 text-white placeholder:text-slate-500 nodrag nopan nowheel"
          />
          <Button
            onClick={data.onSubmit}
            disabled={data.disabled || !data.value.trim()}
            size="icon"
            aria-label={data.sendLabel}
            className="h-9 w-9 bg-blue-600 hover:bg-blue-700 flex-shrink-0 nodrag nopan"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}
      <Handle type="source" position={Position.Right} className={handleDot} />
    </div>
  )
}

function StepNode({ data }: NodeProps & { data: StepData }) {
  const { label, index, state } = data
  return (
    <div className="relative">
      {state === "active" && (
        <div className="absolute -inset-1.5 rounded-3xl bg-blue-500/40 blur-lg animate-pulse pointer-events-none" />
      )}
      <div
        className={`relative w-[230px] rounded-3xl border-2 p-4 shadow-lg transition-all duration-300 ${
          state === "active"
            ? "border-blue-400 bg-blue-500/15 scale-105"
            : state === "done"
              ? "border-blue-500/40 bg-zinc-900/90"
              : "border-white/15 bg-zinc-900/70"
        }`}
      >
        <Handle type="target" position={Position.Left} className={handleDot} />
        <div className="flex items-center gap-2.5">
          <span
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 border ${
              state === "done"
                ? "bg-blue-500/25 border-blue-500/50 text-blue-300"
                : "bg-blue-500/10 border-blue-500/30 text-blue-400"
            }`}
          >
            {state === "done" ? <Check className="w-4 h-4" /> : <Cog className="w-4 h-4" />}
          </span>
          <span className="text-sm text-slate-200 leading-snug">{label}</span>
        </div>
        {state === "active" && (
          <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
        )}
        <Handle type="source" position={Position.Right} className={handleDot} />
      </div>
    </div>
  )
}

function OutputNode({ data }: NodeProps & { data: OutputData }) {
  const hasOutput = Boolean(data.output)
  return (
    <div className="relative">
      {hasOutput && (
        <div className="absolute -inset-1.5 rounded-3xl bg-blue-500/40 blur-lg pointer-events-none" />
      )}
      <div
        className={`relative w-[270px] rounded-3xl border-2 p-4 shadow-xl transition-all duration-300 ${
          hasOutput
            ? "border-blue-400 bg-gradient-to-br from-blue-500/20 via-zinc-900 to-zinc-900"
            : "border-white/15 bg-zinc-900/70"
        }`}
      >
        <Handle type="target" position={Position.Left} className={handleDot} />
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-blue-500/25 flex items-center justify-center flex-shrink-0">
            <Check className="w-4.5 h-4.5 text-blue-300" />
          </div>
          <span className="text-[11px] uppercase tracking-wider text-blue-300 font-bold">
            {data.label}
          </span>
        </div>
        <div className="text-sm text-blue-50 min-h-[20px] leading-relaxed">
          {data.output || "…"}
        </div>
      </div>
    </div>
  )
}

export const nodeTypes = {
  trigger: TriggerNode,
  step: StepNode,
  result: OutputNode,
}
