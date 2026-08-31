"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  type Node,
  type Edge,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import {
  nodeTypes,
  type TriggerData,
  type StepData,
  type OutputData,
} from "./flow-diagram-nodes"

/**
 * Diagrama de flujo interactivo (React Flow) para probar en vivo una automatización.
 * Recibe: `flow: AutomationFlow` (icon/title/description/steps/demoPlaceholder/demoOutputTemplate) + labels traducidos.
 * Procesa: el usuario escribe un input y dispara `runFlow`, que avanza un nodo por paso cada `STEP_DELAY_MS`.
 * Produce: canvas de React Flow (trigger → steps → resultado), con el output final armado desde `demoOutputTemplate`.
 * Los 3 nodos viven en `flow-diagram-nodes.tsx`; los overrides `.react-flow__*` en `app/globals.css`.
 */
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
  demoMode?: "text" | "file"
  demoFileLabel?: string
}

export function FlowDiagram({
  flow,
  tryPrompt,
  sendLabel,
  outputLabel,
  replayLabel,
  heightClassName = "h-[560px] sm:h-[680px]",
}: {
  flow: AutomationFlow
  tryPrompt: string
  sendLabel: string
  outputLabel: string
  replayLabel?: string
  heightClassName?: string
}) {
  const [input, setInput] = useState("")
  const [activeStep, setActiveStep] = useState(-1)
  const [isRunning, setIsRunning] = useState(false)
  const [output, setOutput] = useState("")

  const isFileMode = flow.demoMode === "file"
  const fileLabel = flow.demoFileLabel || "factura.pdf"

  const runFlow = () => {
    if (isRunning) return
    if (!isFileMode && !input.trim()) return
    setOutput("")
    setIsRunning(true)
    setActiveStep(0)
  }

  useEffect(() => {
    if (!isFileMode || isRunning || output || activeStep >= 0) return
    const t = setTimeout(runFlow, 900)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFileMode, isRunning, output, activeStep])

  useEffect(() => {
    if (!isRunning) return

    if (activeStep >= flow.steps.length) {
      const value = isFileMode ? fileLabel : input.trim()
      setOutput(flow.demoOutputTemplate.replace("{input}", value))
      setIsRunning(false)
      return
    }

    const timer = setTimeout(() => {
      setActiveStep((s) => s + 1)
    }, STEP_DELAY_MS)

    return () => clearTimeout(timer)
  }, [isRunning, activeStep, flow, input, isFileMode, fileLabel])

  const replay = () => {
    setOutput("")
    setActiveStep(-1)
    setIsRunning(false)
  }

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
          mode: isFileMode ? "file" : "text",
          fileLabel,
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
    <div className={`relative ${heightClassName} w-full rounded-2xl overflow-hidden border border-white/10 bg-black`}>
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none z-0" />
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
      {isFileMode && output && (
        <button
          type="button"
          onClick={replay}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-xs px-3 py-1.5 rounded-md border border-blue-600/50 bg-black/70 backdrop-blur text-blue-400 hover:bg-blue-600/10 transition-colors"
        >
          {replayLabel}
        </button>
      )}
    </div>
  )
}
