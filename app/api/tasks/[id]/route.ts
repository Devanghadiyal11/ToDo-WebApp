import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getUserFromToken } from "@/lib/auth"
import type { Task } from "@/lib/types"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const userId = getUserFromToken(token)
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { title, description, category, priority, dueDate, isCompleted, subtasks } = await request.json()
    const taskId = params.id

    const db = await getDatabase()
    const tasks = db.collection<Task>("tasks")

    const updateData: Partial<Task> = {
      updatedAt: new Date(),
    }

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (priority !== undefined) updateData.priority = priority
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : undefined
    if (isCompleted !== undefined) updateData.isCompleted = isCompleted

    if (subtasks !== undefined) {
      updateData.subtasks = Array.isArray(subtasks)
        ? subtasks
            .map((s: any) => ({
              id: typeof s.id === "string" && s.id.length > 0 ? s.id : new ObjectId().toString(),
              title: String(s.title || "").trim(),
              isCompleted: Boolean(s.isCompleted),
            }))
            .filter((s) => s.title.length > 0)
        : []
    }

    const result = await tasks.updateOne({ _id: new ObjectId(taskId), userId }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Task updated successfully" })
  } catch (error) {
    console.error("Update task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const userId = getUserFromToken(token)
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const taskId = params.id

    const db = await getDatabase()
    const tasks = db.collection<Task>("tasks")

    const result = await tasks.deleteOne({ _id: new ObjectId(taskId), userId })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("Delete task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
