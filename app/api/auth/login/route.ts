import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyPassword, generateToken } from "@/lib/auth"
import type { User } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    console.log("Login attempt for email:", email)

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const db = await getDatabase()
    const users = db.collection<User>("users")

    // Find user by email
    const user = await users.findOne({ email })
    console.log("User found:", user ? "Yes" : "No")
    
    if (!user) {
      console.log("User not found for email:", email)
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash)
    console.log("Password valid:", isValidPassword)
    
    if (!isValidPassword) {
      console.log("Invalid password for user:", email)
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Generate token
    const token = generateToken(user._id!.toString())

    return NextResponse.json({
      message: "Login successful",
      token,
      user: {
        id: user._id!.toString(),
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
