import { getJobTypes } from "@/lib/actions/job-type";
import { getJobDetails } from "@/lib/actions/job-detail";
import { getFeeders } from "@/lib/actions/feeder";
import { getTeams } from "@/lib/actions/team";
import AntdForm from "./antd-form";
import type {
  JobTypeWithCount,
  JobDetailWithCount,
  FeederWithStation,
  Team,
} from "@/types/query-types";

export default async function Form2Page() {
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
    <AntdForm
      jobTypes={jobTypes}
      jobDetails={jobDetails}
      feeders={feeders}
      teams={teams}
    />
  );
}
