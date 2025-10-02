import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getUserFromToken } from "@/lib/auth"
import type { Task } from "@/lib/types"
import { ObjectId } from "mongodb"

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

    const userTasks = await tasks.find({ userId }).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({ tasks: userTasks })
  } catch (error) {
    console.error("Get tasks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const userId = getUserFromToken(token)
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { title, description, category, priority, dueDate, subtasks } = await request.json()

    if (!title || !category || !priority) {
      return NextResponse.json({ error: "Title, category, and priority are required" }, { status: 400 })
    }

    const db = await getDatabase()
    const tasks = db.collection<Task>("tasks")

    const sanitizedSubtasks = Array.isArray(subtasks)
      ? subtasks
          .map((s: any) => ({
            id: typeof s.id === "string" && s.id.length > 0 ? s.id : new ObjectId().toString(),
            title: String(s.title || "").trim(),
            isCompleted: Boolean(s.isCompleted),
          }))
          .filter((s: any) => s.title.length > 0)
      : []

    const newTask: Omit<Task, "_id"> = {
      userId,
      title,
      description: description || "",
      category,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      isCompleted: false,
      subtasks: sanitizedSubtasks,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await tasks.insertOne(newTask)

    return NextResponse.json({
      message: "Task created successfully",
      task: { ...newTask, _id: result.insertedId.toString() },
    })
  } catch (error) {
    console.error("Create task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
