import type { Task } from "./types"

const STORAGE_KEY = "v0-local-tasks"

function safeParse(json: string | null): Task[] {
  if (!json) return []
  try {
    const data = JSON.parse(json) as Task[]
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export function getTasks(): Task[] {
  if (typeof window === "undefined") return []
  return safeParse(window.localStorage.getItem(STORAGE_KEY))
}

export function setTasks(tasks: Task[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export function genId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID()
  return Math.random().toString(36).slice(2)
}
