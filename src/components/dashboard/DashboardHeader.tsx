interface DashboardHeaderProps {
  title?: string
  description?: string
}

export function DashboardHeader({
  title = "Executive Dashboard",
  description = "Overview of Hotline Unit Performance",
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between space-y-2">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
