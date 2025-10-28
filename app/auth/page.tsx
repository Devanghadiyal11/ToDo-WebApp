"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-5xl px-4 py-10 md:py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Brand / Benefits Panel */}
          <section className="rounded-xl border bg-card p-6 md:p-8">
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-balance">TaskFlow</h1>
              <p className="text-muted-foreground mt-2">Professional Todo Management for teams and individuals.</p>
            </div>

            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Priorities, Tags, Due dates</p>
                  <p className="text-sm text-muted-foreground">Stay organized with clear context.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Subtasks & Checklists</p>
                  <p className="text-sm text-muted-foreground">Break work down into actionable steps.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Analytics</p>
                  <p className="text-sm text-muted-foreground">Understand throughput and focus areas.</p>
                </div>
              </li>
            </ul>

            <div className="mt-8 rounded-lg bg-secondary/50 border p-4">
              <p className="text-sm text-muted-foreground">
                Tip: Use a strong password. You can switch between Sign in and Sign up on the right.
              </p>
            </div>

            <div className="mt-8">
              <img src="/abstract-dashboard.png" alt="TaskFlow dashboard preview" className="rounded-lg border max-w-full h-auto" />
            </div>
          </section>

          {/* Auth Panel */}
          <section className="rounded-xl border bg-card p-6 md:p-8">
            <div className="mb-6 flex items-center rounded-lg border bg-muted/30 p-1">
              <Button
                type="button"
                variant={isLogin ? "default" : "ghost"}
                className="w-1/2"
                onClick={() => setIsLogin(true)}
                aria-pressed={isLogin}
                aria-label="Show Sign in"
              >
                Sign in
              </Button>
              <Button
                type="button"
                variant={!isLogin ? "default" : "ghost"}
                className="w-1/2"
                onClick={() => setIsLogin(false)}
                aria-pressed={!isLogin}
                aria-label="Show Sign up"
              >
                Create account
              </Button>
            </div>

            {isLogin ? (
              <LoginForm onToggleMode={() => setIsLogin(false)} />
            ) : (
              <RegisterForm onToggleMode={() => setIsLogin(true)} />
            )}

            <p className="mt-6 text-center text-xs text-muted-foreground">
              By continuing, you agree to our Terms & Privacy Policy.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
