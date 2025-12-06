import BaseLayout from "./BaseLayout";

const myProposalsMenuItems = [
  { label: "Proposal", path: "/my-proposals" },
  { label: "Invites", path: "/my-proposals/invites" },
];

const MyPrposalsLayout: React.FC = () => {
  return <BaseLayout menuItems={myProposalsMenuItems}/>;
};

export default MyPrposalsLayout;