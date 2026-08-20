"use client"

import { useMemo } from "react"
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
import { Globe, ShieldCheck, Server, Database, HardDrive, Network, Box } from "lucide-react"

/**
 * Diagrama de infraestructura (React Flow, solo lectura) para el detalle de un proyecto.
 * Recibe: `steps: DeploymentStep[]` (`{icon, label}`, orden = orden del diagrama).
 * Produce: `null` si no hay steps; si no, nodos en zigzag conectados con flechas animadas.
 */
const X_SPACING = 240
const Y_STAGGER = 110

export const deploymentIconMap = {
  globe: Globe,
  shield: ShieldCheck,
  server: Server,
  database: Database,
  storage: HardDrive,
  network: Network,
  box: Box,
} as const

export type DeploymentIconKey = keyof typeof deploymentIconMap

interface DeploymentStep {
  icon: DeploymentIconKey
  label: string
}

type InfraNodeData = {
  label: string
  icon: DeploymentIconKey
  isEdge: boolean // primer o último nodo (Internet / almacenamiento) vs. servicio propio
}

const handleDot = "!w-3 !h-3 !bg-blue-500 !border-2 !border-black"

function InfraNode({ data }: NodeProps & { data: InfraNodeData }) {
  const Icon = deploymentIconMap[data.icon] || Box
  return (
    <div
      className={`w-[200px] rounded-2xl border-2 p-4 shadow-lg backdrop-blur-sm ${
        data.isEdge
          ? "border-white/15 bg-zinc-900/70"
          : "border-blue-500/50 bg-blue-500/10"
      }`}
    >
      <Handle type="target" position={Position.Left} className={handleDot} />
      <div className="flex items-center gap-2.5">
        <span
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${
            data.isEdge
              ? "bg-white/5 border-white/10 text-slate-300"
              : "bg-blue-500/20 border-blue-500/40 text-blue-300"
          }`}
        >
          <Icon className="w-4.5 h-4.5" />
        </span>
        <span className="text-sm text-slate-200 leading-snug whitespace-pre-line">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Right} className={handleDot} />
    </div>
  )
}

const nodeTypes = { infra: InfraNode }

export function DeploymentDiagram({ steps }: { steps: DeploymentStep[] }) {
  const stagger = (i: number) => (i % 2 === 0 ? 0 : Y_STAGGER)

  const nodes: Node[] = useMemo(
    () =>
      steps.map((step, i) => ({
        id: `n-${i}`,
        type: "infra",
        position: { x: X_SPACING * i, y: stagger(i) },
        draggable: false,
        data: { label: step.label, icon: step.icon, isEdge: i === 0 || i === steps.length - 1 } satisfies InfraNodeData,
      })),
    [steps]
  )

  const edges: Edge[] = useMemo(
    () =>
      steps.slice(0, -1).map((_, i) => ({
        id: `e-${i}`,
        source: `n-${i}`,
        target: `n-${i + 1}`,
        animated: true,
        style: { stroke: "#3b82f6", strokeWidth: 2.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#3b82f6", width: 20, height: 20 },
      })),
    [steps]
  )

  if (steps.length === 0) return null

  return (
    <div className="relative h-[320px] sm:h-[380px] w-full rounded-2xl overflow-hidden border border-white/10 bg-black">
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none z-0" />
      <style>{`
        .react-flow__attribution { background: transparent; color: #52525b; font-size: 10px; }
        .react-flow__attribution a { color: #3b82f6; }
        .react-flow__node.selected { box-shadow: none !important; outline: none !important; }
        .react-flow__node { cursor: default; }
        .react-flow__controls { background: transparent; box-shadow: none; gap: 4px; }
        .react-flow__controls-button {
          background: rgba(24, 24, 27, 0.9);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 6px;
          color: #93c5fd;
        }
        .react-flow__controls-button:hover { background: rgba(59, 130, 246, 0.15); color: #fff; }
      `}</style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch
        zoomOnDoubleClick
        minZoom={0.5}
        maxZoom={2}
        panOnDrag
        attributionPosition="bottom-left"
        className="relative z-10"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="#3b82f640" />
        <Controls showInteractive={false} position="bottom-right" />
      </ReactFlow>
    </div>
  )
}
