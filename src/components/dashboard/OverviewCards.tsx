import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Users, Wrench, AlertTriangle } from "lucide-react"

interface OverviewCardsProps {
  summary: {
    totalTasks: number
    activeTeams: number
    topJobType: string
    topFeeder: string
  }
}

export function OverviewCards({ summary }: OverviewCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Tasks
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalTasks}</div>
          <p className="text-xs text-muted-foreground">
            Total work records in period
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Active Teams
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.activeTeams}</div>
          <p className="text-xs text-muted-foreground">
            Teams reporting work
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Job Type</CardTitle>
          <Wrench className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate" title={summary.topJobType}>
            {summary.topJobType}
          </div>
          <p className="text-xs text-muted-foreground">
            Most frequent work type
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Problem Feeder
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.topFeeder}</div>
          <p className="text-xs text-muted-foreground">
            Feeder with most tasks
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
