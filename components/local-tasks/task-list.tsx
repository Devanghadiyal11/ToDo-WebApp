"use client"

import { TaskCard } from "./task-card"
import type { Task } from "@/lib/local-tasks/types"

export function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return <div className="text-sm text-muted-foreground">No tasks yet. Create your first task above.</div>
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {tasks.map((t) => (
        <TaskCard key={t.id} task={t} />
      ))}
    </div>
  )
}
