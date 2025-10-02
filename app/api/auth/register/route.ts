import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { hashPassword, generateToken } from "@/lib/auth"
import type { User } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    const db = await getDatabase()
    const users = db.collection<User>("users")

    // Check if user already exists
    const existingUser = await users.findOne({ email })
    console.log("Checking existing user for email:", email, "Found:", existingUser ? "Yes" : "No")
    
    if (existingUser) {
      console.log("User already exists with email:", email)
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Create new user
    const passwordHash = await hashPassword(password)
    const newUser: Omit<User, "_id"> = {
      name,
      email,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await users.insertOne(newUser)
    const token = generateToken(result.insertedId.toString())

    // Create default categories for the new user
    const categories = db.collection("categories")
    const defaultCategories = [
      { userId: result.insertedId.toString(), name: "Work", color: "#3B82F6", createdAt: new Date() },
      { userId: result.insertedId.toString(), name: "Personal", color: "#10B981", createdAt: new Date() },
      { userId: result.insertedId.toString(), name: "Study", color: "#8B5CF6", createdAt: new Date() },
      { userId: result.insertedId.toString(), name: "Health", color: "#F59E0B", createdAt: new Date() },
    ]
    await categories.insertMany(defaultCategories)

    return NextResponse.json({
      message: "User created successfully",
      token,
      user: {
        id: result.insertedId.toString(),
        name,
        email,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
