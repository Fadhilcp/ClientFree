import FiilterBox from "../../components/ui/FiilterBox";
import BaseLayout from "./BaseLayout";

const freelancersMenuItems = [
  { label: "Freelancers", path: "/freelancers" },
  { label: "Interested Freelancers", path: "/freelancers/interested" },
];

const FreelancerFilters = () => (
  <FiilterBox enabledFilters={["location", "experience", "hourlyRateMin", "hourlyRateMax", "ratingMin", "skills"]}/>
);

const FreelancersLayout: React.FC = () => {
  return <BaseLayout menuItems={freelancersMenuItems} filterBox={<FreelancerFilters />} />;
};

export default FreelancersLayout;