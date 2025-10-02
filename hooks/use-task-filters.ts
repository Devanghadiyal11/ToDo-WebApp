"use client"

import { useState, useMemo } from "react"
import type { Task } from "@/lib/types"
import type { FilterState } from "@/components/tasks/advanced-filters"

const defaultFilters: FilterState = {
  search: "",
  category: "all",
  status: "all",
  priority: "all",
  sortBy: "createdAt",
  sortOrder: "desc",
}

export function useTaskFilters(tasks: Task[]) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters)

  const filteredAndSortedTasks = useMemo(() => {
    const filtered = tasks.filter((task) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          task.title.toLowerCase().includes(searchLower) || task.description?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Category filter
      if (filters.category !== "all" && task.category !== filters.category) {
        return false
      }

      // Status filter
      if (filters.status !== "all") {
        if (filters.status === "completed" && !task.isCompleted) return false
        if (filters.status === "pending" && task.isCompleted) return false
        if (filters.status === "overdue") {
          const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.isCompleted
          if (!isOverdue) return false
        }
      }

      // Priority filter
      if (filters.priority !== "all" && task.priority !== filters.priority) {
        return false
      }

      // Due date range filter
      if (filters.dueDateFrom || filters.dueDateTo) {
        if (!task.dueDate) return false

        const taskDueDate = new Date(task.dueDate)
        if (filters.dueDateFrom) {
          const fromDate = new Date(filters.dueDateFrom)
          fromDate.setHours(0, 0, 0, 0)
          if (taskDueDate < fromDate) return false
        }
        if (filters.dueDateTo) {
          const toDate = new Date(filters.dueDateTo)
          toDate.setHours(23, 59, 59, 999)
          if (taskDueDate > toDate) return false
        }
      }

      return true
    })

    // Sort tasks
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (filters.sortBy) {
        case "title":
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case "dueDate":
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0
          break
        case "priority":
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
          aValue = priorityOrder[a.priority]
          bValue = priorityOrder[b.priority]
          break
        case "updatedAt":
          aValue = new Date(a.updatedAt).getTime()
          bValue = new Date(b.updatedAt).getTime()
          break
        case "createdAt":
        default:
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
      }

      if (filters.sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })

    return filtered
  }, [tasks, filters])

  const clearFilters = () => {
    setFilters(defaultFilters)
  }

  const applyFilters = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  return {
    filters,
    filteredTasks: filteredAndSortedTasks,
    setFilters,
    clearFilters,
    applyFilters,
  }
}
