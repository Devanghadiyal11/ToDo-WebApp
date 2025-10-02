"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, Clock, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { PriorityIndicator } from "./priority-indicator"
import type { Task, Subtask } from "@/lib/types"
import { useTasks } from "@/hooks/use-tasks"
import { useCategories } from "@/hooks/use-categories"
import { format } from "date-fns"

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const { toggleTask, deleteTask, updateTask } = useTasks()
  const { categories } = useCategories()
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      await toggleTask(task._id!, !task.isCompleted)
    } catch (error) {
      console.error("Failed to toggle task:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(task._id!)
      } catch (error) {
        console.error("Failed to delete task:", error)
      }
    }
  }

  // Find category color
  const category = categories.find((cat: any) => cat.name === task.category)
  const categoryColor = category?.color || "#6B7280"

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.isCompleted

  // Compute subtask progress
  const totalSubtasks = task.subtasks?.length ?? 0
  const completedSubtasks = task.subtasks?.filter((s) => s.isCompleted).length ?? 0

  // Inline toggle handler for subtasks
  const toggleSubtask = async (subId: string) => {
    if (!task.subtasks) return
    const next: Subtask[] = task.subtasks.map((s) => (s.id === subId ? { ...s, isCompleted: !s.isCompleted } : s))
    try {
      await updateTask(task._id!, { subtasks: next } as any)
    } catch (e) {
      console.error("[v0] Failed to toggle subtask:", e)
    }
  }

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-lg ${task.isCompleted ? "opacity-60" : ""} ${isOverdue ? "border-red-500/50" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox checked={task.isCompleted} onCheckedChange={handleToggle} disabled={isLoading} className="mt-1" />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3
                className={`font-medium text-sm leading-tight ${task.isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}
              >
                {task.title}
              </h3>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(task)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {task.description && (
              <p
                className={`text-xs mb-3 ${task.isCompleted ? "line-through text-muted-foreground" : "text-muted-foreground"}`}
              >
                {task.description}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="border-2"
                style={{
                  backgroundColor: `${categoryColor}20`,
                  borderColor: `${categoryColor}50`,
                  color: categoryColor,
                }}
              >
                <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: categoryColor }} />
                {task.category}
              </Badge>

              <PriorityIndicator priority={task.priority} />

              {task.dueDate && (
                <div
                  className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-400" : "text-muted-foreground"}`}
                >
                  {isOverdue ? <Clock className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                  {format(new Date(task.dueDate), "MMM d")}
                </div>
              )}

              {/* Show subtask progress */}
              {totalSubtasks > 0 && (
                <div className="text-xs text-muted-foreground">
                  {completedSubtasks}/{totalSubtasks} subtasks
                </div>
              )}
            </div>

            {/* Inline subtasks list */}
            {totalSubtasks > 0 && (
              <div className="mt-3 space-y-2">
                {task.subtasks!.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      className="h-3 w-3 accent-primary"
                      checked={s.isCompleted}
                      onChange={() => toggleSubtask(s.id)}
                      aria-label={`Toggle ${s.title}`}
                    />
                    <span className={s.isCompleted ? "line-through text-muted-foreground" : "text-foreground"}>
                      {s.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
