"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface TrendChartProps {
  data: Array<{ date: string; completed: number }>
}

export function TrendChart({ data }: TrendChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const formattedData = data.map((item) => ({
    ...item,
    formattedDate: formatDate(item.date),
  }))

  // Calculate moving average for smoother trend line
  const movingAverageData = formattedData.map((item, index) => {
    const start = Math.max(0, index - 2)
    const end = Math.min(formattedData.length, index + 3)
    const slice = formattedData.slice(start, end)
    const average = slice.reduce((sum, d) => sum + d.completed, 0) / slice.length

    return {
      ...item,
      movingAverage: average,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">30-Day Completion Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={movingAverageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="formattedDate"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              interval="preserveStartEnd"
            />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                color: "hsl(var(--foreground))",
              }}
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 3 }}
              name="Daily Completed"
            />
            <Line
              type="monotone"
              dataKey="movingAverage"
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Trend"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
