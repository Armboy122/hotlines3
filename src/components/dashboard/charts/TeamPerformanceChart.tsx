"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TeamPerformanceChartProps {
  data: {
    name: string
    value: number
  }[]
}

export function TeamPerformanceChart({ data }: TeamPerformanceChartProps) {
  return (
    <Card className="col-span-4 md:col-span-2">
      <CardHeader>
        <CardTitle>Team Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              width={100}
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <Tooltip cursor={{ fill: 'transparent' }} />
            <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} name="Tasks" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
