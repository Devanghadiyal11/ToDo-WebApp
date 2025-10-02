"use client"

import { useState } from "react"
import type { Priority, Task } from "@/lib/local-tasks/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useLocalTasks } from "@/hooks/use-local-tasks"
import { X } from "lucide-react"

const PRIORITIES: Priority[] = ["low", "medium", "high"]
const TAGS = ["red", "amber", "green", "blue", "gray"] as const

function TagDot({ tag }: { tag: Task["colorTag"] }) {
  const c =
    tag === "red"
      ? "bg-red-500"
      : tag === "amber"
        ? "bg-amber-500"
        : tag === "green"
          ? "bg-green-600"
          : tag === "blue"
            ? "bg-blue-600"
            : "bg-gray-500"
  return <span aria-hidden className={`inline-block h-3 w-3 rounded-full ${c}`} />
}

export function TaskForm() {
  const { create } = useLocalTasks()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [colorTag, setColorTag] = useState<Task["colorTag"]>("blue")
  const [dueDate, setDueDate] = useState<string>("")
  const [subtaskTitle, setSubtaskTitle] = useState("")
  const [subtasks, setSubtasks] = useState<Array<{ title: string }>>([])

  function reset() {
    setTitle("")
    setDescription("")
    setPriority("medium")
    setColorTag("blue")
    setDueDate("")
    setSubtaskTitle("")
    setSubtasks([])
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        if (!title.trim()) return
        await create({
          title: title.trim(),
          description: description.trim(),
          priority,
          colorTag,
          dueDate: dueDate || undefined,
          subtasks,
        })
        reset()
      }}
      className="flex flex-col gap-4"
      aria-label="Create task form"
    >
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="e.g. Prepare project brief"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Optional details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
            <SelectTrigger aria-label="Select priority">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Color Tag</Label>
          <Select value={colorTag} onValueChange={(v) => setColorTag(v as Task["colorTag"])}>
            <SelectTrigger aria-label="Select color tag">
              <SelectValue placeholder="Select color tag" />
            </SelectTrigger>
            <SelectContent>
              {TAGS.map((t) => (
                <SelectItem key={t} value={t}>
                  <div className="flex items-center gap-2">
                    <TagDot tag={t} />
                    <span className="capitalize">{t}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="due">Due date</Label>
          <Input id="due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="subtask">Subtasks</Label>
        <div className="flex items-center gap-2">
          <Input
            id="subtask"
            placeholder="Add a checklist item"
            value={subtaskTitle}
            onChange={(e) => setSubtaskTitle(e.target.value)}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (!subtaskTitle.trim()) return
              setSubtasks((prev) => [...prev, { title: subtaskTitle.trim() }])
              setSubtaskTitle("")
            }}
          >
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {subtasks.map((s, i) => (
            <Badge key={i} variant="secondary" className="flex items-center gap-2">
              {s.title}
              <button
                type="button"
                aria-label={`Remove ${s.title}`}
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setSubtasks((prev) => prev.filter((_, idx) => idx !== i))}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Create Task</Button>
      </div>
    </form>
  )
}
