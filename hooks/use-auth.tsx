"use client"

import { useState, createContext, useContext, useEffect, type ReactNode } from "react"
import useSWR from "swr"

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const fetcher = async (url: string) => {
  const token = localStorage.getItem("token")
  console.log("Fetcher called with token:", token ? "Present" : "Missing")
  
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  console.log("Fetcher response status:", res.status)

  if (!res.ok) {
    console.log("Fetcher error response:", res.status, res.statusText)
    throw new Error("Failed to fetch user")
  }

  const data = await res.json()
  console.log("Fetcher successful, user data:", data)
  return data
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [hasToken, setHasToken] = useState(false)

  // Check for token on mount and when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      setHasToken(!!token)
      console.log("Token check on mount/change:", !!token)
    }
  }, [])

  const { data, mutate, error: swrError } = useSWR(
    hasToken ? "/api/auth/me" : null,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      onSuccess: (data) => {
        console.log("SWR onSuccess:", data)
      },
      onError: (error) => {
        console.log("SWR onError:", error)
      },
    },
  )

  console.log("SWR data:", data)
  console.log("SWR error:", swrError)

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Attempting login for:", email)
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      console.log("Login response:", { status: res.status, data })

      if (!res.ok) {
        throw new Error(data.error || "Login failed")
      }

      localStorage.setItem("token", data.token)
      console.log("Token saved:", data.token)
      setHasToken(true)
      console.log("hasToken set to true, calling mutate...")
      mutate()
      console.log("Mutate called, checking token in localStorage:", localStorage.getItem("token"))
      
      // Manual redirect to dashboard after successful login
      setTimeout(() => {
        console.log("Redirecting to dashboard...")
        if (typeof window !== "undefined") {
          window.location.href = "/dashboard"
        }
      }, 100)
    } catch (err) {
      console.error("Login error:", err)
      const errorMessage = err instanceof Error ? err.message : "Login failed"
      setError(errorMessage)
      // Don't throw error to prevent app crash, just set error state
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Registration failed")
      }

      localStorage.setItem("token", data.token)
      setHasToken(true)
      mutate()
      
      // Manual redirect to dashboard after successful registration
      setTimeout(() => {
        console.log("Redirecting to dashboard after registration...")
        if (typeof window !== "undefined") {
          window.location.href = "/dashboard"
        }
      }, 100)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Registration failed"
      setError(errorMessage)
      // Don't throw error to prevent app crash, just set error state
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setHasToken(false)
    mutate(null, false)
    // Redirect to auth page after logout
    if (typeof window !== "undefined") {
      window.location.href = "/auth"
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user: data?.user || null,
        login,
        register,
        logout,
        isLoading: isLoading || (!data && hasToken && !swrError),
        error: error || (swrError ? "Authentication failed" : null),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
