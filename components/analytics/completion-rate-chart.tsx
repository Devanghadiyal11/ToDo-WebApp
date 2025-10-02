"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useCategories } from "@/hooks/use-categories"

interface CompletionRateChartProps {
  data: Record<string, { total: number; completed: number; rate: number }>
}

export function CompletionRateChart({ data }: CompletionRateChartProps) {
  const { categories } = useCategories()

  const sortedData = Object.entries(data)
    .sort(([, a], [, b]) => b.rate - a.rate)
    .slice(0, 6) // Show top 6 categories

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Completion Rate by Category</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedData.map(([category, stats]) => {
          const categoryInfo = categories.find((cat: any) => cat.name === category)
          const color = categoryInfo?.color || "#6B7280"

          return (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-sm font-medium">{category}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {stats.completed}/{stats.total} ({stats.rate.toFixed(0)}%)
                </div>
              </div>
              <Progress
                value={stats.rate}
                className="h-2"
                style={
                  {
                    "--progress-background": `${color}40`,
                    "--progress-foreground": color,
                  } as React.CSSProperties
                }
              />
            </div>
          )
        })}

        {sortedData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No data available yet. Create some tasks to see completion rates!
          </div>
        )}
      </CardContent>
    </Card>
  )
}
