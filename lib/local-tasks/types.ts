export type Priority = "low" | "medium" | "high"
export type Status = "todo" | "in-progress" | "done"

export type Subtask = {
  id: string
  title: string
  done: boolean
}

export type Task = {
  id: string
  title: string
  description?: string
  priority: Priority
  colorTag: "red" | "amber" | "green" | "blue" | "gray"
  dueDate?: string // ISO date string (yyyy-mm-dd)
  status: Status
  subtasks: Subtask[]
  createdAt: string
  updatedAt: string
}
