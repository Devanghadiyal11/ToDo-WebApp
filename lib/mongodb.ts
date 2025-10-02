import { MongoClient, type Db } from "mongodb"

if (!process.env.MONGODB_URI) {
  console.warn("Missing MONGODB_URI environment variable - using default local MongoDB")
}

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ToDoList"
const options = {}

function parseDbNameFromUri(u: string): string | null {
  // Matches mongodb://.../<dbName>?... or mongodb+srv://.../<dbName>?...
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

const dbName = process.env.MONGODB_DB || parseDbNameFromUri(uri) || "ToDoList" // default to your requested name

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export async function getDatabase(): Promise<Db> {
  try {
    const client = await clientPromise
    return client.db(dbName)
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw new Error("Failed to connect to database")
  }
}

export default clientPromise
