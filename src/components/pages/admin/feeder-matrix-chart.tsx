'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { FeederJobMatrix } from '@/types/api'

type JobDetail = FeederJobMatrix['jobDetails'][number]

const CHART_COLORS = {
  green: ['#10B981', '#059669', '#047857', '#34D399', '#6EE7B7'],
  greenDark: ['#047857', '#065F46', '#064E3B', '#059669', '#10B981'],
  yellow: ['#F59E0B', '#D97706', '#B45309', '#FBBF24', '#FCD34D'],
  gray: ['#6B7280', '#4B5563', '#374151', '#9CA3AF', '#D1D5DB'],
}

interface FeederMatrixChartProps {
  jobDetails: JobDetail[]
}

export default function FeederMatrixChart({ jobDetails }: FeederMatrixChartProps) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(300, jobDetails.length * 50)}>
      <BarChart data={jobDetails} layout="vertical" margin={{ left: 20, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis
          type="category"
          dataKey="name"
          width={200}
          tick={{ fontSize: 12 }}
          interval={0}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload as JobDetail
              return (
                <div className="bg-white p-3 border border-green-200 rounded-lg shadow-lg">
                  <p className="font-semibold text-green-900">{data.name}</p>
                  <p className="text-sm text-green-700">ประเภท: {data.jobTypeName}</p>
                  <p className="text-sm font-bold text-green-600">จำนวน: {data.count} ครั้ง</p>
                </div>
              )
            }
            return null
          }}
        />
        <Bar dataKey="count" radius={[0, 8, 8, 0]}>
          {jobDetails.map((_, index) => {
            const colorArray = [CHART_COLORS.green, CHART_COLORS.greenDark, CHART_COLORS.yellow, CHART_COLORS.gray]
            const selectedColors = colorArray[index % colorArray.length]
            return <Cell key={`cell-${index}`} fill={selectedColors[0]} />
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
