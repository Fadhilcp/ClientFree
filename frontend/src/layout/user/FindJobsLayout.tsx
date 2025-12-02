import FiilterBox from "../../components/ui/FiilterBox";
import BaseLayout from "./BaseLayout";

const findJobsMenuItems = [
  { label: "Jobs", path: "/find-jobs" },
  { label: "Interested Jobs", path: "/find-jobs/interested" },
];

const JobFilters = () => (
  <FiilterBox/>
);

const FindJobsLayout: React.FC = () => {
  return <BaseLayout menuItems={findJobsMenuItems} filterBox={<JobFilters />} />;
};

export default FindJobsLayout;