"use client"

import { useState } from "react"
import { TaskForm } from "@/components/local-tasks/task-form"
import { useLocalTasks } from "@/hooks/use-local-tasks"
import { TaskList } from "@/components/local-tasks/task-list"
import { Kanban } from "@/components/local-tasks/kanban"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Task } from "@/lib/local-tasks/types"

function applySearch(tasks: Task[], q: string) {
  if (!q.trim()) return tasks
  const s = q.toLowerCase()
  return tasks.filter((t) => t.title.toLowerCase().includes(s) || (t.description || "").toLowerCase().includes(s))
}

function applyFilters(tasks: Task[], opts: { priority?: Task["priority"]; colorTag?: Task["colorTag"] }) {
  return tasks.filter((t) => {
    if (opts.priority && t.priority !== opts.priority) return false
    if (opts.colorTag && t.colorTag !== opts.colorTag) return false
    return true
  })
}

export default function LocalTasksPage() {
  const { tasks } = useLocalTasks()
  const [query, setQuery] = useState("")
  const [priority, setPriority] = useState<Task["priority"] | "all">("all")
  const [colorTag, setColorTag] = useState<Task["colorTag"] | "all">("all")

  let filtered = applySearch(tasks, query)
  filtered = applyFilters(filtered, {
    priority: priority === "all" ? undefined : priority,
    colorTag: colorTag === "all" ? undefined : colorTag,
  })

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-balance">Local Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Priority, color tags, due dates, and subtasks — stored in your browser.
          </p>
        </div>
        <Button asChild>
          <a href="/">Back to Home</a>
        </Button>
      </header>

      <section aria-labelledby="create-task" className="grid gap-4">
        <h2 id="create-task" className="text-lg font-medium">
          Create a task
        </h2>
        <TaskForm />
      </section>

      <section aria-labelledby="filters" className="grid gap-3">
        <h2 id="filters" className="text-lg font-medium">
          Browse
        </h2>
        <div className="flex flex-col md:flex-row items-start md:items-end gap-3">
          <div className="grid gap-1">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search by title or description"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="priority">Priority</Label>
            <select
              id="priority"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="grid gap-1">
            <Label htmlFor="tag">Color tag</Label>
            <select
              id="tag"
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              value={colorTag}
              onChange={(e) => setColorTag(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="red">Red</option>
              <option value="amber">Amber</option>
              <option value="green">Green</option>
              <option value="blue">Blue</option>
              <option value="gray">Gray</option>
            </select>
          </div>
        </div>
      </section>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="space-y-4">
          <TaskList tasks={filtered} />
        </TabsContent>
        <TabsContent value="kanban" className="space-y-4">
          <Kanban tasks={filtered} />
        </TabsContent>
      </Tabs>
    </main>
  )
}
