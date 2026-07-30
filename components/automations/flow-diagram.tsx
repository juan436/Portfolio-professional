"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  MarkerType,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Check, Send, Sparkles, Cog } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const X_SPACING = 260
const Y_STAGGER = 150
const STEP_DELAY_MS = 900

interface AutomationFlow {
  icon: string
  title: string
  description: string
  steps: string[]
  demoPlaceholder: string
  demoOutputTemplate: string
}

type TriggerData = {
  label: string
  value: string
  disabled: boolean
  placeholder: string
  sendLabel: string
  onChange: (value: string) => void
  onSubmit: () => void
}

type StepData = {
  label: string
  index: number
  state: "pending" | "active" | "done"
}

type OutputData = {
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

const nodeTypes = {
  trigger: TriggerNode,
  step: StepNode,
  result: OutputNode,
}

export function FlowDiagram({
  flow,
  tryPrompt,
  sendLabel,
  outputLabel,
}: {
  flow: AutomationFlow
  tryPrompt: string
  sendLabel: string
  outputLabel: string
}) {
  const [input, setInput] = useState("")
  const [activeStep, setActiveStep] = useState(-1)
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState("")

  const runFlow = () => {
    if (!input.trim() || isRunning) return
    setOutput("")
    setIsRunning(true)
    setActiveStep(0)
  }

  useEffect(() => {
    if (!isRunning) return

    if (activeStep >= flow.steps.length) {
      setOutput(flow.demoOutputTemplate.replace("{input}", input.trim()))
      setIsRunning(false)
      return
    }

    const timer = setTimeout(() => {
      setActiveStep((s) => s + 1)
    }, STEP_DELAY_MS)

    return () => clearTimeout(timer)
  }, [isRunning, activeStep, flow, input])

  // Posiciones en zigzag: cada nodo alterna arriba/abajo para que el
  // canvas no se lea como una lista recta, más parecido a un editor de
  // workflows (n8n/Zapier) que a un checklist.
  const stagger = (i: number) => (i % 2 === 0 ? 0 : Y_STAGGER)

  const nodes: Node[] = useMemo(() => {
    const list: Node[] = [
      {
        id: "trigger",
        type: "trigger",
        position: { x: 0, y: stagger(0) },
        draggable: false,
        data: {
          label: tryPrompt,
          value: input,
          disabled: isRunning,
          placeholder: flow.demoPlaceholder,
          sendLabel,
          onChange: setInput,
          onSubmit: runFlow,
        } satisfies TriggerData,
      },
    ]

    flow.steps.forEach((step, i) => {
      const state: StepData["state"] =
        activeStep > i ? "done" : activeStep === i && isRunning ? "active" : "pending"

      list.push({
        id: `step-${i}`,
        type: "step",
        position: { x: X_SPACING * (i + 1), y: stagger(i + 1) },
        draggable: false,
        data: { label: step, index: i, state } satisfies StepData,
      })
    })

    list.push({
      id: "output",
      type: "result",
      position: { x: X_SPACING * (flow.steps.length + 1), y: stagger(flow.steps.length + 1) },
      draggable: false,
      data: { label: outputLabel, output } satisfies OutputData,
    })

    return list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow, input, isRunning, activeStep, output, tryPrompt, sendLabel, outputLabel])

  const edges: Edge[] = useMemo(() => {
    const started = isRunning || Boolean(output)
    const list: Edge[] = [
      {
        id: "e-trigger-step0",
        source: "trigger",
        target: "step-0",
        animated: started,
        style: { stroke: started ? "#3b82f6" : "#3f3f4680", strokeWidth: 2.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: started ? "#3b82f6" : "#3f3f46", width: 22, height: 22 },
      },
    ]

    flow.steps.forEach((_, i) => {
      const isLast = i === flow.steps.length - 1
      const targetId = isLast ? "output" : `step-${i + 1}`
      const passed = activeStep > i || Boolean(output)

      list.push({
        id: `e-step${i}-${targetId}`,
        source: `step-${i}`,
        target: targetId,
        animated: passed,
        style: { stroke: passed ? "#3b82f6" : "#3f3f4680", strokeWidth: 2.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: passed ? "#3b82f6" : "#3f3f46", width: 22, height: 22 },
      })
    })

    return list
  }, [flow, activeStep, isRunning, output])

  return (
    <div className="relative h-[560px] sm:h-[680px] w-full rounded-2xl overflow-hidden border border-white/10 bg-black">
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none z-0" />
      <style>{`
        .react-flow__attribution {
          background: transparent;
          color: #52525b;
          font-size: 10px;
        }
        .react-flow__attribution a {
          color: #3b82f6;
        }
        .react-flow__node.selected {
          box-shadow: none !important;
          outline: none !important;
        }
        .react-flow__node {
          cursor: default;
        }
        .react-flow__controls {
          background: transparent;
          box-shadow: none;
          gap: 4px;
        }
        .react-flow__controls-button {
          background: rgba(24, 24, 27, 0.9);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 6px;
          color: #93c5fd;
        }
        .react-flow__controls-button:hover {
          background: rgba(59, 130, 246, 0.15);
          color: #fff;
        }
        .react-flow__controls-button:last-child {
          border-bottom: 1px solid rgba(59, 130, 246, 0.2);
        }
      `}</style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        nodesDraggable={false}
        nodesConnectable={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch
        zoomOnDoubleClick
        minZoom={0.4}
        maxZoom={2}
        panOnDrag
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: false }}
        className="relative z-10"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="#3b82f640" />
        <Controls showInteractive={false} position="bottom-right" />
      </ReactFlow>
    </div>
  )
}
