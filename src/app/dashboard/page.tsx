import { prisma } from "@/lib/prisma"
import DashboardClient from "./DashboardClient"

export const metadata = {
  title: "Executive Dashboard",
  description: "Overview of Hotline Unit Performance",
}

export default async function DashboardPage() {
  const teams = await prisma.team.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })

  const feeders = await prisma.feeder.findMany({
    select: { id: true, code: true },
    orderBy: { code: 'asc' }
  })

  const serializedTeams = teams.map(t => ({ ...t, id: t.id.toString() }))
  const serializedFeeders = feeders.map(f => ({ ...f, id: f.id.toString() }))

  return (
    <DashboardClient 
      teams={serializedTeams} 
      feeders={serializedFeeders} 
    />
  )
}
