"use client"

import type React from "react"
import type { Task, Subtask } from "@/lib/types"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { PriorityIndicator } from "./priority-indicator"
import { useTasks } from "@/hooks/use-tasks"
import { useCategories } from "@/hooks/use-categories"

interface TaskFormProps {
  task?: Task | null
  isOpen: boolean
  onClose: () => void
}

const priorities = ["low", "medium", "high", "urgent"] as const

export function TaskForm({ task, isOpen, onClose }: TaskFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium")
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")

  const { createTask, updateTask } = useTasks()
  const { categories } = useCategories()

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || "")
      setCategory(task.category)
      setPriority(task.priority)
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined)
      setSubtasks(task.subtasks || [])
    } else {
      setTitle("")
      setDescription("")
      setCategory("")
      setPriority("medium")
      setDueDate(undefined)
      setSubtasks([])
    }
  }, [task])

  const addSubtask = () => {
    const title = newSubtaskTitle.trim()
    if (!title) return
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2)
    setSubtasks((prev) => [...prev, { id, title, isCompleted: false }])
    setNewSubtaskTitle("")
  }

  const removeSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id))
  }

  const toggleSubtask = (id: string) => {
    setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, isCompleted: !s.isCompleted } : s)))
  }

  const updateSubtaskTitle = (id: string, title: string) => {
    setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !category || !priority) return

    setIsLoading(true)
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        dueDate: dueDate?.toISOString(),
        subtasks,
      }

      if (task) {
        await updateTask(task._id!, taskData)
      } else {
        await createTask(taskData as any)
      }

      onClose()
    } catch (error) {
      console.error("Failed to save task:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description (optional)"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat._id} value={cat.name}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as any)} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p} value={p}>
                      <div className="flex items-center gap-2">
                        <PriorityIndicator priority={p} showIcon={false} />
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Due Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-transparent"
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Subtasks</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a subtask"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={addSubtask}
                disabled={isLoading || !newSubtaskTitle.trim()}
              >
                Add
              </Button>
            </div>

            {subtasks.length > 0 && (
              <div className="mt-2 space-y-2 max-h-40 overflow-auto">
                {subtasks.map((s) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-primary"
                      checked={s.isCompleted}
                      onChange={() => toggleSubtask(s.id)}
                      aria-label={`Toggle ${s.title}`}
                    />
                    <Input
                      value={s.title}
                      onChange={(e) => updateSubtaskTitle(s.id, e.target.value)}
                      className="flex-1"
                    />
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeSubtask(s.id)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading || !title.trim() || !category}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {task ? "Updating..." : "Creating..."}
                </>
              ) : task ? (
                "Update Task"
              ) : (
                "Create Task"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
