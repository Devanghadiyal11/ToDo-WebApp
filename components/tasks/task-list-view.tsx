"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, Clock, MoreHorizontal, Pencil, Trash2, Grid3X3, List } from "lucide-react"
import { PriorityIndicator } from "./priority-indicator"
import type { Task, Subtask } from "@/lib/types"
import { useTasks } from "@/hooks/use-tasks"
import { useCategories } from "@/hooks/use-categories"
import { format } from "date-fns"

interface TaskListViewProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  viewMode: "grid" | "list"
  onViewModeChange: (mode: "grid" | "list") => void
}

export function TaskListView({ tasks, onEdit, viewMode, onViewModeChange }: TaskListViewProps) {
  const { toggleTask, deleteTask } = useTasks()
  const { categories } = useCategories()

  const handleToggle = async (taskId: string, isCompleted: boolean) => {
    try {
      await toggleTask(taskId, !isCompleted)
    } catch (error) {
      console.error("Failed to toggle task:", error)
    }
  }

  const handleDelete = async (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId)
      } catch (error) {
        console.error("Failed to delete task:", error)
      }
    }
  }

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find((cat: any) => cat.name === categoryName)
    return category?.color || "#6B7280"
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">No tasks match your current filters.</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex justify-end">
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className="h-8 w-8 p-0"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("list")}
            className="h-8 w-8 p-0"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tasks */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onEdit={onEdit} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskListItem
              key={task._id}
              task={task}
              onEdit={onEdit}
              onToggle={handleToggle}
              onDelete={handleDelete}
              categoryColor={getCategoryColor(task.category)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface TaskListItemProps {
  task: Task
  onEdit: (task: Task) => void
  onToggle: (taskId: string, isCompleted: boolean) => void
  onDelete: (taskId: string) => void
  categoryColor: string
}

function TaskListItem({ task, onEdit, onToggle, onDelete, categoryColor }: TaskListItemProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { updateTask } = useTasks()

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      await onToggle(task._id!, task.isCompleted)
    } finally {
      setIsLoading(false)
    }
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.isCompleted
  const totalSubtasks = task.subtasks?.length ?? 0
  const completedSubtasks = task.subtasks?.filter((s) => s.isCompleted).length ?? 0

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
    <Card className={`transition-all duration-200 hover:shadow-md ${task.isCompleted ? "opacity-60" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Checkbox checked={task.isCompleted} onCheckedChange={handleToggle} disabled={isLoading} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-medium text-sm truncate ${task.isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <p
                    className={`text-xs mt-1 truncate ${task.isCompleted ? "line-through text-muted-foreground" : "text-muted-foreground"}`}
                  >
                    {task.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge
                  variant="outline"
                  className="text-xs"
                  style={{
                    backgroundColor: `${categoryColor}20`,
                    borderColor: `${categoryColor}50`,
                    color: categoryColor,
                  }}
                >
                  {task.category}
                </Badge>

                <PriorityIndicator priority={task.priority} size="sm" />

                {task.dueDate && (
                  <div
                    className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-400" : "text-muted-foreground"}`}
                  >
                    {isOverdue ? <Clock className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                    {format(new Date(task.dueDate), "MMM d")}
                  </div>
                )}

                {totalSubtasks > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {completedSubtasks}/{totalSubtasks} subtasks
                  </div>
                )}

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
                    <DropdownMenuItem onClick={() => onDelete(task._id!)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {totalSubtasks > 0 && (
          <div className="mt-3 space-y-2">
            {task.subtasks!.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  className="h-3 w-3 accent-primary"
                  checked={s.isCompleted}
                  onChange={() => toggleSubtask(s.id)}
                />
                <span className={s.isCompleted ? "line-through text-muted-foreground" : "text-foreground"}>
                  {s.title}
                </span>
              </label>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Re-export TaskCard for grid view
function TaskCard({ task, onEdit }: { task: Task; onEdit: (task: Task) => void }) {
  const { toggleTask, deleteTask, updateTask } = useTasks()
  const { categories } = useCategories()
  const [isLoading, setIsLoading] = useState(false)

  const category = categories.find((cat: any) => cat.name === task.category)
  const categoryColor = category?.color || "#6B7280"
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.isCompleted
  const totalSubtasks = task.subtasks?.length ?? 0
  const completedSubtasks = task.subtasks?.filter((s) => s.isCompleted).length ?? 0

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

              {totalSubtasks > 0 && (
                <div className="text-xs text-muted-foreground">
                  {completedSubtasks}/{totalSubtasks} subtasks
                </div>
              )}
            </div>

            {totalSubtasks > 0 && (
              <div className="mt-3 space-y-2">
                {task.subtasks!.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      className="h-3 w-3 accent-primary"
                      checked={s.isCompleted}
                      onChange={() => toggleSubtask(s.id)}
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
