import { useSelector } from "react-redux";
import BaseLayout from "./BaseLayout";
import type { RootState } from "../../store/store";

const ClientPaymentsMenuItems = [
  { label: "Overview", path: "/payments/overview" },
  { label: "Wallet", path: "/payments/wallet" },
  { label: "Withdrawals", path: "/payments/withdrawals" },
  { label: "Escrow & Milestones", path: "/payments/escrow-milestones" },
  { label: "Transactions", path: "/payments/transactions" },
  { label: "Invoices & Reports", path: "/payments/invoices-reports"}
];

const FreelancerPaymentsMenuItems = [
  { label: "Overview", path: "/payments/overview" },
  { label: "Wallet", path: "/payments/wallet" },
  { label: "Withdrawals", path: "/payments/withdrawals" },
  { label: "In Escrow", path: "/payments/escrow" },
  { label: "Transactions", path: "/payments/transactions" },
  { label: "Invoices & Reports", path: "/payments/invoices-reports"}
];

const PaymentsLayout: React.FC = () => {

  const user = useSelector((state: RootState) => state.auth.user)

  return <BaseLayout menuItems={user?.role === "client" ? ClientPaymentsMenuItems : FreelancerPaymentsMenuItems} />;
};

export default PaymentsLayout;