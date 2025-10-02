import useSWR from "swr"
import { getTasks, setTasks, genId } from "@/lib/local-tasks/storage"
import type { Task, Subtask, Status, Priority } from "@/lib/local-tasks/types"

const KEY = "local-tasks"

export function useLocalTasks() {
  const { data, mutate } = useSWR<Task[]>(KEY, getTasks, { fallbackData: [] })

  const tasks = data || []

  async function commit(next: Task[]) {
    setTasks(next)
    // no revalidation needed since it's local
    await mutate(next, false)
  }

  function upsert(task: Task) {
    const exists = tasks.some((t) => t.id === task.id)
    const next = exists ? tasks.map((t) => (t.id === task.id ? task : t)) : [...tasks, task]
    return commit(next)
  }

  function create(input: {
    title: string
    description?: string
    priority: Priority
    colorTag: Task["colorTag"]
    dueDate?: string
    status?: Status
    subtasks?: Array<Pick<Subtask, "title">>
  }) {
    const now = new Date().toISOString()
    const task: Task = {
      id: genId(),
      title: input.title,
      description: input.description || "",
      priority: input.priority,
      colorTag: input.colorTag,
      dueDate: input.dueDate,
      status: input.status || "todo",
      subtasks: (input.subtasks || []).map((s) => ({ id: genId(), title: s.title, done: false })),
      createdAt: now,
      updatedAt: now,
    }
    return upsert(task)
  }

  function update(id: string, patch: Partial<Omit<Task, "id" | "createdAt">>) {
    const next = tasks.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t))
    return commit(next)
  }

  function remove(id: string) {
    const next = tasks.filter((t) => t.id !== id)
    return commit(next)
  }

  function toggleSubtask(taskId: string, subtaskId: string) {
    const next = tasks.map((t) => {
      if (t.id !== taskId) return t
      return {
        ...t,
        subtasks: t.subtasks.map((s) => (s.id === subtaskId ? { ...s, done: !s.done } : s)),
        updatedAt: new Date().toISOString(),
      }
    })
    return commit(next)
  }

  function addSubtask(taskId: string, title: string) {
    const next = tasks.map((t) => {
      if (t.id !== taskId) return t
      return {
        ...t,
        subtasks: [...t.subtasks, { id: genId(), title, done: false }],
        updatedAt: new Date().toISOString(),
      }
    })
    return commit(next)
  }

  function removeSubtask(taskId: string, subtaskId: string) {
    const next = tasks.map((t) => {
      if (t.id !== taskId) return t
      return {
        ...t,
        subtasks: t.subtasks.filter((s) => s.id !== subtaskId),
        updatedAt: new Date().toISOString(),
      }
    })
    return commit(next)
  }

  return {
    tasks,
    create,
    update,
    remove,
    toggleSubtask,
    addSubtask,
    removeSubtask,
  }
}
