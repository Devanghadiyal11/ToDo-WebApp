"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Task } from "@/lib/local-tasks/types"
import { useLocalTasks } from "@/hooks/use-local-tasks"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

function tagClasses(tag: Task["colorTag"]) {
  return tag === "red"
    ? "bg-red-100 text-red-700"
    : tag === "amber"
      ? "bg-amber-100 text-amber-800"
      : tag === "green"
        ? "bg-green-100 text-green-800"
        : tag === "blue"
          ? "bg-blue-100 text-blue-800"
          : "bg-gray-100 text-gray-800"
}

function priorityColor(p: Task["priority"]) {
  return p === "high" ? "text-red-600" : p === "medium" ? "text-amber-600" : "text-green-600"
}

function subtaskProgress(task: Task) {
  const total = task.subtasks.length || 0
  const done = task.subtasks.filter((s) => s.done).length
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  return { total, done, pct }
}

export function TaskCard({ task }: { task: Task }) {
  const { toggleSubtask, update, remove } = useLocalTasks()
  const { total, done, pct } = subtaskProgress(task)

  return (
    <Card aria-label={`Task ${task.title}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-pretty">{task.title}</CardTitle>
            {task.description ? <CardDescription className="text-pretty">{task.description}</CardDescription> : null}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={tagClasses(task.colorTag)}>{task.colorTag}</Badge>
            <span className={`text-sm ${priorityColor(task.priority)}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          </div>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          {task.dueDate ? `Due: ${task.dueDate}` : "No due date"}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div aria-label="Subtask progress" className="text-sm">
          {done}/{total} subtasks • {pct}%
          <div className="mt-1 h-2 bg-muted rounded">
            <div className="h-2 rounded bg-blue-600" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <ul className="space-y-2">
          {task.subtasks.map((s) => (
            <li key={s.id} className="flex items-center gap-2">
              <Checkbox
                checked={s.done}
                onCheckedChange={() => toggleSubtask(task.id, s.id)}
                aria-label={`Toggle ${s.title}`}
              />
              <span className={s.done ? "line-through text-muted-foreground" : ""}>{s.title}</span>
            </li>
          ))}
          {task.subtasks.length === 0 ? <li className="text-sm text-muted-foreground">No subtasks</li> : null}
        </ul>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted-foreground">Status: {task.status}</div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const next = task.status === "todo" ? "in-progress" : task.status === "in-progress" ? "done" : "todo"
                update(task.id, { status: next })
              }}
            >
              Advance Status
            </Button>
            <Button variant="destructive" size="sm" onClick={() => remove(task.id)}>
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
