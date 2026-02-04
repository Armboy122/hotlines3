import { getJobTypes } from "@/lib/actions/job-type";
import { getJobDetails } from "@/lib/actions/job-detail";
import { getFeeders } from "@/lib/actions/feeder";
import { getTeams } from "@/lib/actions/team";
import TaskDailyForm from "@/features/task-daily/components/task-daily-form";
import type {
  JobTypeWithCount,
  JobDetailWithCount,
  FeederWithStation,
  Team,
} from "@/types/query-types";

import { Suspense } from "react";
import { FormSkeleton } from "@/components/ui/skeletons";

export default async function Home() {
  const [jobTypesRes, jobDetailsRes, feedersRes, teamsRes] = await Promise.all([
    getJobTypes(),
    getJobDetails(),
    getFeeders(),
    getTeams(),
  ]);

  const jobTypes = (jobTypesRes.success ? jobTypesRes.data : []) as JobTypeWithCount[];
  const jobDetails = (jobDetailsRes.success ? jobDetailsRes.data : []) as JobDetailWithCount[];
  const feeders = (feedersRes.success ? feedersRes.data : []) as FeederWithStation[];
  const teams = (teamsRes.success ? teamsRes.data : []) as Team[];

  return (
    <Suspense fallback={<FormSkeleton />}>
      <TaskDailyForm
        jobTypes={jobTypes}
        jobDetails={jobDetails}
        feeders={feeders}
        teams={teams}
      />
    </Suspense>
  );
}
