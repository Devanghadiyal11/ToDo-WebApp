import { MongoClient } from "mongodb"

function parseDbNameFromUri(u) {
  const match = u.match(/^[^/]*\/\/[^/]+\/([^?]+)/)
  if (match && match[1]) {
    try {
      return decodeURIComponent(match[1])
    } catch {
      return match[1]
    }
  }
  return null
}

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error("Missing MONGODB_URI. Please add it in Project Settings → Environment Variables.")
  }

  const dbName = process.env.MONGODB_DB || parseDbNameFromUri(uri) || "ToDoList"
  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db(dbName)

    console.log(`[v0] Connected. Using database: ${dbName}`)

    // Users collection + indexes
    await db.collection("users").createIndexes([{ key: { email: 1 }, unique: true }, { key: { createdAt: 1 } }])
    console.log("[v0] users indexes ensured")

    // Tasks collection + indexes
    await db
      .collection("tasks")
      .createIndexes([
        { key: { userId: 1 } },
        { key: { userId: 1, isCompleted: 1 } },
        { key: { userId: 1, category: 1 } },
        { key: { userId: 1, priority: 1 } },
        { key: { userId: 1, dueDate: 1 } },
        { key: { createdAt: 1 } },
      ])
    console.log("[v0] tasks indexes ensured")

    // Categories collection + indexes
    await db
      .collection("categories")
      .createIndexes([{ key: { userId: 1 } }, { key: { userId: 1, name: 1 }, unique: true }])
    console.log("[v0] categories indexes ensured")

    // NOTE: We do NOT insert global default categories here,
    // because defaults are created per-user during registration.

    console.log("[v0] Database setup completed successfully!")
  } finally {
    await client.close()
  }
}

main().catch((err) => {
  console.error("[v0] Database setup failed:", err)
  process.exit(1)
})
