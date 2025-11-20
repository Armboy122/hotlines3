"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FeederChartProps {
  data: {
    name: string
    value: number
  }[]
}

export function FeederChart({ data }: FeederChartProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Top 10 Problem Feeders</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="name"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px' }}
            />
            <Legend />
            <Bar dataKey="value" fill="#adfa1d" radius={[4, 4, 0, 0]} name="Tasks" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
