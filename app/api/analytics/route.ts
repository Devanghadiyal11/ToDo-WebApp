import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getUserFromToken } from "@/lib/auth"
import type { Task, TaskStats } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const userId = getUserFromToken(token)
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const db = await getDatabase()
    const tasks = db.collection<Task>("tasks")

    // Get all user tasks
    const userTasks = await tasks.find({ userId }).toArray()

    // Calculate basic stats
    const total = userTasks.length
    const completed = userTasks.filter((task) => task.isCompleted).length
    const pending = total - completed
    const overdue = userTasks.filter(
      (task) => task.dueDate && new Date(task.dueDate) < new Date() && !task.isCompleted,
    ).length

    // Group by category
    const byCategory = userTasks.reduce(
      (acc, task) => {
        acc[task.category] = (acc[task.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Group by priority
    const byPriority = userTasks.reduce(
      (acc, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Completion rate by category
    const completionByCategory = Object.keys(byCategory).reduce(
      (acc, category) => {
        const categoryTasks = userTasks.filter((task) => task.category === category)
        const completedInCategory = categoryTasks.filter((task) => task.isCompleted).length
        acc[category] = {
          total: categoryTasks.length,
          completed: completedInCategory,
          rate: categoryTasks.length > 0 ? (completedInCategory / categoryTasks.length) * 100 : 0,
        }
        return acc
      },
      {} as Record<string, { total: number; completed: number; rate: number }>,
    )

    // Weekly activity (last 7 days)
    const weeklyActivity = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const tasksCreated = userTasks.filter((task) => {
        const taskDate = new Date(task.createdAt)
        return taskDate >= date && taskDate < nextDate
      }).length

      const tasksCompleted = userTasks.filter((task) => {
        const taskDate = new Date(task.updatedAt)
        return task.isCompleted && taskDate >= date && taskDate < nextDate
      }).length

      weeklyActivity.push({
        date: date.toISOString().split("T")[0],
        created: tasksCreated,
        completed: tasksCompleted,
      })
    }

    // Monthly trends (last 30 days)
    const monthlyTrends = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const completedTasks = userTasks.filter((task) => {
        const taskDate = new Date(task.updatedAt)
        return task.isCompleted && taskDate >= date && taskDate < nextDate
      }).length

      monthlyTrends.push({
        date: date.toISOString().split("T")[0],
        completed: completedTasks,
      })
    }

    const analytics: TaskStats & {
      completionByCategory: Record<string, { total: number; completed: number; rate: number }>
      weeklyActivity: Array<{ date: string; created: number; completed: number }>
      monthlyTrends: Array<{ date: string; completed: number }>
      completionRate: number
    } = {
      total,
      completed,
      pending,
      overdue,
      byCategory,
      byPriority,
      completionByCategory,
      weeklyActivity,
      monthlyTrends,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
    }

    return NextResponse.json({ analytics })
  } catch (error) {
    console.error("Get analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
