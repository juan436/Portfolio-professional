"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Search, X, ChevronDown, ChevronUp, ExternalLink, Check, Palette } from "lucide-react"
import { renderDevIcon } from "@/lib/devicon-utils"

// Lista completa de iconos de Devicon organizados por categoría
const deviconIcons = [
  // Frontend
  { value: "react", label: "React", category: "frontend" },
  { value: "nextjs", label: "Next.js", category: "frontend" },
  { value: "typescript", label: "TypeScript", category: "frontend" },
  { value: "javascript", label: "JavaScript", category: "frontend" },
  { value: "html5", label: "HTML5", category: "frontend" },
  { value: "css3", label: "CSS3", category: "frontend" },
  { value: "tailwindcss", label: "Tailwind CSS", category: "frontend" },
  { value: "bootstrap", label: "Bootstrap", category: "frontend" },
  { value: "sass", label: "Sass", category: "frontend" },
  { value: "vuejs", label: "Vue.js", category: "frontend" },
  { value: "angular", label: "Angular", category: "frontend" },
  { value: "redux", label: "Redux", category: "frontend" },
  { value: "webpack", label: "Webpack", category: "frontend" },
  { value: "babel", label: "Babel", category: "frontend" },
  { value: "jquery", label: "jQuery", category: "frontend" },
  { value: "materialui", label: "Material UI", category: "frontend" },
  { value: "flutter", label: "Flutter", category: "frontend" },
  { value: "svelte", label: "Svelte", category: "frontend" },

  // Backend
  { value: "nodejs", label: "Node.js", category: "backend" },
  { value: "express", label: "Express", category: "backend" },
  { value: "php", label: "PHP", category: "backend" },
  { value: "laravel", label: "Laravel", category: "backend" },
  { value: "python", label: "Python", category: "backend" },
  { value: "django", label: "Django", category: "backend" },
  { value: "flask", label: "Flask", category: "backend" },
  { value: "ruby", label: "Ruby", category: "backend" },
  { value: "rails", label: "Rails", category: "backend" },
  { value: "java", label: "Java", category: "backend" },
  { value: "spring", label: "Spring", category: "backend" },
  { value: "csharp", label: "C#", category: "backend" },
  { value: "dotnetcore", label: ".NET Core", category: "backend" },
  { value: "go", label: "Go", category: "backend" },
  { value: "rust", label: "Rust", category: "backend" },
  { value: "graphql", label: "GraphQL", category: "backend" },
  { value: "nestjs", label: "NestJS", category: "backend" },

  // Database
  { value: "mongodb", label: "MongoDB", category: "database" },
  { value: "mysql", label: "MySQL", category: "database" },
  { value: "postgresql", label: "PostgreSQL", category: "database" },
  { value: "sqlite", label: "SQLite", category: "database" },
  { value: "redis", label: "Redis", category: "database" },
  { value: "firebase", label: "Firebase", category: "database" },
  { value: "supabase", label: "Supabase", category: "database" },
  { value: "oracle", label: "Oracle", category: "database" },
  { value: "mariadb", label: "MariaDB", category: "database" },
  { value: "dynamodb", label: "DynamoDB", category: "database" },
  { value: "cassandra", label: "Cassandra", category: "database" },
  { value: "neo4j", label: "Neo4j", category: "database" },

  // DevOps
  { value: "git", label: "Git", category: "devops" },
  { value: "github", label: "GitHub", category: "devops" },
  { value: "gitlab", label: "GitLab", category: "devops" },
  { value: "docker", label: "Docker", category: "devops" },
  { value: "kubernetes", label: "Kubernetes", category: "devops" },
  { value: "jenkins", label: "Jenkins", category: "devops" },
  { value: "ansible", label: "Ansible", category: "devops" },
  { value: "terraform", label: "Terraform", category: "devops" },
  { value: "amazonwebservices", label: "AWS", category: "devops" },
  { value: "azure", label: "Azure", category: "devops" },
  { value: "googlecloud", label: "Google Cloud", category: "devops" },
  { value: "linux", label: "Linux", category: "devops" },
  { value: "nginx", label: "Nginx", category: "devops" },
  { value: "vercel", label: "Vercel", category: "devops" },
  { value: "heroku", label: "Heroku", category: "devops" },
  { value: "netlify", label: "Netlify", category: "devops" },
]

interface IconSelectorProps {
  selectedIcon: string
  onSelectIcon: (icon: string) => void
  category?: string
}

export default function IconSelector({ selectedIcon, onSelectIcon, category }: IconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [useColored, setUseColored] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Filtrar iconos por categoría si se proporciona
  const filteredIcons = deviconIcons.filter((icon) => {
    // Filtrar por categoría si está especificada
    if (category && icon.category !== category) {
      return false
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      return (
        icon.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        icon.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return true
  })

  // Enfocar el input de búsqueda cuando se abre el popover
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Renderizar el ícono de Devicon
  const renderDevIconWrapper = (iconName: string) => {
    return renderDevIcon(iconName, useColored, "text-xl")
  }

  return (
    <div>
      <Label>Ícono</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className="w-full justify-between bg-black/40 border-blue-700/20 mt-2"
          >
            <div className="flex items-center">
              {selectedIcon ? (
                <>
                  <span className="mr-2">{renderDevIconWrapper(selectedIcon)}</span>
                  <span>
                    {deviconIcons.find((icon) => icon.value === selectedIcon)?.label || selectedIcon}
                  </span>
                </>
              ) : (
                "Seleccionar ícono"
              )}
            </div>
            {isOpen ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[300px] p-0 bg-black border-blue-700/20"
          align="start"
          side="bottom"
          sideOffset={5}
        >
          <div className="flex items-center p-2 border-b border-blue-700/20">
            <Search className="mr-2 h-4 w-4 text-slate-400" />
            <Input
              ref={searchInputRef}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar ícono..."
              className="border-0 bg-transparent rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          <div className="flex items-center px-3 py-2 border-b border-blue-700/20">
            <Palette className="mr-2 h-4 w-4 text-slate-400" />
            <span className="text-sm mr-2">Mostrar iconos a color</span>
            <Switch
              checked={useColored}
              onCheckedChange={setUseColored}
              className="ml-auto data-[state=checked]:bg-blue-700"
            />
          </div>

          <ScrollArea className="h-[300px]">
            {filteredIcons.length > 0 ? (
              <div className="grid grid-cols-3 gap-1 p-2">
                {filteredIcons.map((icon) => (
                  <Button
                    key={icon.value}
                    variant="ghost"
                    className={`flex items-center justify-start p-2 ${
                      selectedIcon === icon.value
                        ? "bg-blue-700/20 text-blue-400"
                        : "hover:bg-blue-900/20"
                    }`}
                    onClick={() => {
                      onSelectIcon(icon.value)
                      setIsOpen(false)
                    }}
                  >
                    <div className="flex items-center">
                      <span className="mr-2">{renderDevIconWrapper(icon.value)}</span>
                      <span className="truncate text-xs">{icon.label}</span>
                      {selectedIcon === icon.value && (
                        <Check className="ml-1 h-3 w-3 text-blue-500" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-slate-400">No se encontraron iconos</div>
            )}
          </ScrollArea>

          <div className="flex items-center justify-between p-2 border-t border-blue-700/20">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => window.open("https://devicon.dev/", "_blank")}
            >
              <ExternalLink className="mr-1 h-3 w-3" />
              Ver todos los iconos
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
