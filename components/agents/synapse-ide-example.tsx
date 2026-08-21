"use client"

import { Sparkles } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

/**
 * Ejemplo estático (sin animación) de cómo el editor de código de un dev usa
 * Synapse vía MCP mientras programa — layout tipo IDE real: archivo a la
 * izquierda, chat del agente a la derecha, mismo patrón que Cursor/Claude
 * Code con un panel de chat lateral. El dev pide una pantalla, el agente
 * responde citando la estructura de datos real documentada en el cerebro del
 * equipo y genera el código acorde. Deliberadamente genérico (campos de
 * ejemplo, no el esquema real de ningún proyecto).
 * Recibe: nada (usa `useLanguage` para el texto en el idioma activo).
 * Produce: mockup de editor de 2 columnas (código + chat) con cita de Synapse.
 */

interface Copy {
  filePath: string
  heading: string
  chatLabel: string
  userPrompt: string
  assistantReply: string
  badge: string
  codeLines: string[]
}

const COPY: Record<"es" | "en" | "fr" | "it", Copy> = {
  es: {
    filePath: "ProductoForm.tsx",
    heading: "Así lo ve el editor de código del dev",
    chatLabel: "Chat del agente",
    userPrompt: "Crea una pantalla de creación de productos",
    assistantReply: "Según la documentación del equipo, un Producto tiene nombre, precio, categoría y stock. Genero el formulario con esos campos.",
    badge: "Synapse · vía MCP",
    codeLines: [
      "function ProductoForm() {",
      "  return (",
      "    <form>",
      "      <input name=\"nombre\" />",
      "      <input name=\"precio\" />",
      "      <input name=\"categoria\" />",
      "      <input name=\"stock\" />",
      "    </form>",
      "  )",
      "}",
    ],
  },
  en: {
    filePath: "ProductForm.tsx",
    heading: "This is what the dev's code editor sees",
    chatLabel: "Agent chat",
    userPrompt: "Create a product creation screen",
    assistantReply: "According to the team's documentation, a Product has name, price, category and stock. Generating the form with those fields.",
    badge: "Synapse · via MCP",
    codeLines: [
      "function ProductForm() {",
      "  return (",
      "    <form>",
      "      <input name=\"name\" />",
      "      <input name=\"price\" />",
      "      <input name=\"category\" />",
      "      <input name=\"stock\" />",
      "    </form>",
      "  )",
      "}",
    ],
  },
  fr: {
    filePath: "ProductForm.tsx",
    heading: "Voilà ce que voit l'éditeur de code du dev",
    chatLabel: "Chat de l'agent",
    userPrompt: "Crée un écran de création de produit",
    assistantReply: "D'après la documentation de l'équipe, un Produit a un nom, un prix, une catégorie et un stock. Je génère le formulaire avec ces champs.",
    badge: "Synapse · via MCP",
    codeLines: [
      "function ProductForm() {",
      "  return (",
      "    <form>",
      "      <input name=\"nom\" />",
      "      <input name=\"prix\" />",
      "      <input name=\"categorie\" />",
      "      <input name=\"stock\" />",
      "    </form>",
      "  )",
      "}",
    ],
  },
  it: {
    filePath: "ProductForm.tsx",
    heading: "Ecco cosa vede l'editor di codice del dev",
    chatLabel: "Chat dell'agente",
    userPrompt: "Crea una schermata di creazione prodotto",
    assistantReply: "Secondo la documentazione del team, un Prodotto ha nome, prezzo, categoria e stock. Genero il modulo con questi campi.",
    badge: "Synapse · via MCP",
    codeLines: [
      "function ProductForm() {",
      "  return (",
      "    <form>",
      "      <input name=\"nome\" />",
      "      <input name=\"prezzo\" />",
      "      <input name=\"categoria\" />",
      "      <input name=\"stock\" />",
      "    </form>",
      "  )",
      "}",
    ],
  },
}

export function SynapseIdeExample() {
  const { language } = useLanguage()
  const localeCode = (language.code as "es" | "en" | "fr" | "it") in COPY ? (language.code as "es" | "en" | "fr" | "it") : "es"
  const copy = COPY[localeCode]

  return (
    <div className="w-full">
      <h3 className="text-sm font-semibold text-slate-400 text-center mb-4">{copy.heading}</h3>
      <div className="max-w-3xl mx-auto rounded-xl overflow-hidden border border-blue-700/30 bg-[#0b0d10] shadow-[0_20px_60px_-25px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0e1013] border-b border-blue-700/20">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Panel izquierdo: archivo */}
          <div className="md:w-3/5 border-b md:border-b-0 md:border-r border-blue-700/20">
            <div className="px-4 py-2 text-xs text-slate-500 font-mono border-b border-blue-700/10 bg-[#0e1013]">
              {copy.filePath}
            </div>
            <div className="p-4 font-mono text-xs leading-relaxed">
              {copy.codeLines.map((line, i) => (
                <div key={i} className="flex">
                  <span className="w-5 text-right pr-3 text-slate-600 select-none">{i + 1}</span>
                  <span className="flex-1 text-slate-300 whitespace-pre">{line}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Panel derecho: chat del agente */}
          <div className="md:w-2/5 flex flex-col">
            <div className="px-4 py-2 text-xs text-slate-500 font-mono border-b border-blue-700/10 bg-[#0e1013]">
              {copy.chatLabel}
            </div>
            <div className="p-4 space-y-3 flex-1">
              <div className="rounded-lg bg-zinc-800/60 px-3 py-2 text-xs text-slate-300">
                {copy.userPrompt}
              </div>
              <div className="rounded-lg border border-blue-700/30 bg-blue-500/5 p-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase tracking-wide text-blue-400 border border-blue-400/30 rounded-full px-1.5 py-0.5 inline-block mb-1.5">
                      {copy.badge}
                    </span>
                    <p className="text-slate-300 text-xs leading-relaxed">{copy.assistantReply}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
