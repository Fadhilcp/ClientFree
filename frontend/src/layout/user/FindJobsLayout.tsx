import FiilterBox from "../../components/ui/FiilterBox";
import BaseLayout from "./BaseLayout";

const findJobsMenuItems = [
  { label: "Jobs", path: "/find-jobs" },
  { label: "Interested Jobs", path: "/find-jobs/interested" },
];

const JobFilters = () => (
  <FiilterBox enabledFilters={["category", "budgetMin", "budgetMax", "location","workMode", "skills", "sort"]}/>
);

const FindJobsLayout: React.FC = () => {
  return <BaseLayout menuItems={findJobsMenuItems} filterBox={<JobFilters />} />;
};

export default FindJobsLayout;