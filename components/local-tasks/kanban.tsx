"use client"

import type { Task, Status } from "@/lib/local-tasks/types"
import { TaskCard } from "./task-card"

const COLUMNS: { key: Status; title: string }[] = [
  { key: "todo", title: "To Do" },
  { key: "in-progress", title: "In Progress" },
  { key: "done", title: "Done" },
]

export function Kanban({ tasks }: { tasks: Task[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLUMNS.map((col) => {
        const items = tasks.filter((t) => t.status === col.key)
        return (
          <section key={col.key} aria-label={`${col.title} column`} className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">{col.title}</h3>
            <div className="space-y-3">
              {items.length === 0 ? (
                <div className="text-xs text-muted-foreground">No tasks</div>
              ) : (
                items.map((t) => <TaskCard key={t.id} task={t} />)
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
