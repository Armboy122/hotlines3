'use client'

import TaskDailyForm from "@/features/task-daily/components/task-daily-form";
import { FormSkeleton } from "@/components/ui/skeletons";
import { useJobTypes, useJobDetails, useFeeders, useTeams } from "@/hooks/useQueries";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();
  const { data: jobTypes, isLoading: jt } = useJobTypes();
  const { data: jobDetails, isLoading: jd } = useJobDetails();
  const { data: feeders, isLoading: fd } = useFeeders();
  const { data: teams, isLoading: tm } = useTeams();

  if (jt || jd || fd || tm) {
    return <FormSkeleton />;
  }

  // If user role is 'user' with teamId, pre-filter teams to only their team
  const filteredTeams = user?.role === 'user' && user.teamId
    ? (teams || []).filter((t: { id: string }) => t.id === user.teamId)
    : (teams || []);

  return (
    <TaskDailyForm
      jobTypes={jobTypes || []}
      jobDetails={jobDetails || []}
      feeders={feeders || []}
      teams={filteredTeams}
    />
  );
}
