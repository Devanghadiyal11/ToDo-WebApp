import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getUserFromToken } from "@/lib/auth"
import type { Category } from "@/lib/types"

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
    const categories = db.collection<Category>("categories")

    const userCategories = await categories.find({ userId }).sort({ createdAt: 1 }).toArray()

    return NextResponse.json({ categories: userCategories })
  } catch (error) {
    console.error("Get categories error:", error)
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

    const { name, color } = await request.json()

    if (!name || !color) {
      return NextResponse.json({ error: "Name and color are required" }, { status: 400 })
    }

    const db = await getDatabase()
    const categories = db.collection<Category>("categories")

    // Check if category already exists for this user
    const existingCategory = await categories.findOne({ userId, name })
    if (existingCategory) {
      return NextResponse.json({ error: "Category with this name already exists" }, { status: 409 })
    }

    const newCategory: Omit<Category, "_id"> = {
      userId,
      name,
      color,
      createdAt: new Date(),
    }

    const result = await categories.insertOne(newCategory)

    return NextResponse.json({
      message: "Category created successfully",
      category: { ...newCategory, _id: result.insertedId.toString() },
    })
  } catch (error) {
    console.error("Create category error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
