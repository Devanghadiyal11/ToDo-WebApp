"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, BarChart3, Target, Clock, AlertTriangle, LogOut, User } from "lucide-react"
import { StatsCard } from "@/components/analytics/stats-card"
import { ActivityChart } from "@/components/analytics/activity-chart"
import { CategoryChart } from "@/components/analytics/category-chart"
import { CompletionRateChart } from "@/components/analytics/completion-rate-chart"
import { TrendChart } from "@/components/analytics/trend-chart"
import { useAnalytics } from "@/hooks/use-analytics"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

function AnalyticsContent() {
  const { analytics, isLoading } = useAnalytics()
  const { user, logout } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">No analytics data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                Welcome back, {user?.name}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                Dashboard
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Tasks"
            value={analytics.total}
            subtitle="All time"
            icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="Completion Rate"
            value={`${analytics.completionRate.toFixed(1)}%`}
            subtitle="Overall progress"
            trend={analytics.completionRate >= 70 ? "up" : analytics.completionRate >= 40 ? "neutral" : "down"}
            trendValue={`${analytics.completed}/${analytics.total} completed`}
            icon={<Target className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="Pending Tasks"
            value={analytics.pending}
            subtitle="Need attention"
            trend={analytics.pending > analytics.completed ? "down" : "up"}
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="Overdue Tasks"
            value={analytics.overdue}
            subtitle="Past due date"
            trend={analytics.overdue > 0 ? "down" : "up"}
            trendValue={analytics.overdue > 0 ? "Needs attention" : "All caught up!"}
            icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ActivityChart data={analytics.weeklyActivity} />
          <CategoryChart data={analytics.byCategory} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CompletionRateChart data={analytics.completionByCategory} />
          <TrendChart data={analytics.monthlyTrends} />
        </div>

        {/* Priority Breakdown */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Priority Distribution</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(analytics.byPriority).map(([priority, count]) => {
              const priorityColors = {
                low: "text-blue-400",
                medium: "text-yellow-400",
                high: "text-orange-400",
                urgent: "text-red-400",
              }

              return (
                <div key={priority} className="bg-card border border-border rounded-lg p-4 text-center">
                  <div className={`text-2xl font-bold ${priorityColors[priority as keyof typeof priorityColors]}`}>
                    {String(count)}
                  </div>
                  <div className="text-sm text-muted-foreground capitalize">{priority} Priority</div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AnalyticsPage() {
  return <AnalyticsContent />
}
