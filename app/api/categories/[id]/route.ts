import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getUserFromToken } from "@/lib/auth"
import type { Category } from "@/lib/types"
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

    const { name, color } = await request.json()
    const categoryId = params.id

    const db = await getDatabase()
    const categories = db.collection<Category>("categories")

    const updateData: Partial<Category> = {}
    if (name !== undefined) updateData.name = name
    if (color !== undefined) updateData.color = color

    const result = await categories.updateOne({ _id: new ObjectId(categoryId), userId }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Category updated successfully" })
  } catch (error) {
    console.error("Update category error:", error)
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

    const categoryId = params.id

    const db = await getDatabase()
    const categories = db.collection<Category>("categories")
    const tasks = db.collection("tasks")

    // Check if category is being used by any tasks
    const tasksUsingCategory = await tasks.findOne({ userId, category: categoryId })
    if (tasksUsingCategory) {
      return NextResponse.json({ error: "Cannot delete category that is being used by tasks" }, { status: 400 })
    }

    const result = await categories.deleteOne({ _id: new ObjectId(categoryId), userId })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("Delete category error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
