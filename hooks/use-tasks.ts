"use client"

import useSWR from "swr"
import type { Task } from "@/lib/types"
import type { Subtask } from "@/lib/types"

const fetcher = async (url: string) => {
  const token = localStorage.getItem("token")
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!res.ok) {
    throw new Error("Failed to fetch tasks")
  }

  return res.json()
}

export function useTasks() {
  const { data, error, mutate } = useSWR("/api/tasks", fetcher)

  const createTask = async (taskData: Omit<Task, "_id" | "userId" | "createdAt" | "updatedAt">) => {
    const token = localStorage.getItem("token")
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(taskData),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || "Failed to create task")
    }

    mutate()
    return res.json()
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const token = localStorage.getItem("token")
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(updates),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || "Failed to update task")
    }

    mutate()
    return res.json()
  }

  const deleteTask = async (taskId: string) => {
    const token = localStorage.getItem("token")
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || "Failed to delete task")
    }

    mutate()
    return res.json()
  }

  const toggleTask = async (taskId: string, isCompleted: boolean) => {
    return updateTask(taskId, { isCompleted })
  }

  const updateSubtasks = async (taskId: string, subtasks: Subtask[]) => {
    return updateTask(taskId, { subtasks } as Partial<Task>)
  }

  return {
    tasks: data?.tasks || [],
    isLoading: !error && !data,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    updateSubtasks,
    mutate,
  }
}
