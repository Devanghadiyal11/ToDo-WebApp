export interface User {
  _id?: string
  name: string
  email: string
  passwordHash: string
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  _id?: string
  userId: string
  title: string
  description?: string
  category: string
  priority: "low" | "medium" | "high" | "urgent"
  dueDate?: Date
  isCompleted: boolean
  subtasks?: Subtask[]
  createdAt: Date
  updatedAt: Date
}

export interface Subtask {
  id: string
  title: string
  isCompleted: boolean
}

export interface Category {
  _id?: string
  userId: string
  name: string
  color: string
  createdAt: Date
}

export interface TaskStats {
  total: number
  completed: number
  pending: number
  overdue: number
  byCategory: Record<string, number>
  byPriority: Record<string, number>
}
