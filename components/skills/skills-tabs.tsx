"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SkillCard } from "./skill-card"

interface SkillsTabsProps {
  activeTab: string
  setActiveTab: (value: string) => void
  skills: {
    frontend: Array<{ name: string; icon: string; colored?: boolean }>
    backend: Array<{ name: string; icon: string; colored?: boolean }>
    database: Array<{ name: string; icon: string; colored?: boolean }>
    devops: Array<{ name: string; icon: string; colored?: boolean }>
  }
  translatedTexts: {
    frontend: string
    backend: string
    database: string
    devops: string
    [key: string]: string
  }
}

export function SkillsTabs({ activeTab, setActiveTab, skills, translatedTexts }: SkillsTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="flex justify-center mb-8">
        <TabsList className="bg-black/40 border border-blue-700/20">
          <TabsTrigger
            value="frontend"
            className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500"
          >
            {translatedTexts.frontend}
          </TabsTrigger>
          <TabsTrigger
            value="backend"
            className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500"
          >
            {translatedTexts.backend}
          </TabsTrigger>
          <TabsTrigger
            value="database"
            className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500"
          >
            {translatedTexts.database}
          </TabsTrigger>
          <TabsTrigger
            value="devops"
            className="data-[state=active]:bg-blue-700/20 data-[state=active]:text-blue-500"
          >
            {translatedTexts.devops}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="frontend" className="mt-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {skills.frontend.map((skill) => (
            <SkillCard key={skill.name} skill={skill} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="backend" className="mt-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {skills.backend.map((skill) => (
            <SkillCard key={skill.name} skill={skill} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="database" className="mt-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {skills.database.map((skill) => (
            <SkillCard key={skill.name} skill={skill} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="devops" className="mt-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {skills.devops.map((skill) => (
            <SkillCard key={skill.name} skill={skill} />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}
