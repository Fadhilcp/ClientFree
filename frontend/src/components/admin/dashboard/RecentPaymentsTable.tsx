import React from "react";
import ReusableTable from "../../ui/Table";
import type { RecentPayment } from "../../../types/admin/adminDashboard.type";
import type { Column } from "../../../pages/admin/AddOns";

const STATUS_STYLES: Record<string, string> = {
  completed:  "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  pending:    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  released:   "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  failed:     "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  refunded:   "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  cancelled:  "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  processing: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
};

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const columns: Column<RecentPayment>[] = [
  {
    key: "type",
    header: "Type",
    render: (value: string) => (
      <span className="capitalize font-medium text-gray-700 dark:text-gray-200">{value}</span>
    ),
  },
  {
    key: "clientName",
    header: "Client",
    render: (value: string | null) => (
      <span className="text-gray-600 dark:text-gray-300">{value ?? "—"}</span>
    ),
  },
  {
    key: "freelancerName",
    header: "Freelancer",
    render: (value: string | null) => (
      <span className="text-gray-600 dark:text-gray-300">{value ?? "—"}</span>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    render: (value: number, row: RecentPayment) => (
      <span className="font-semibold text-gray-800 dark:text-gray-100">
        {formatCurrency(value, row.currency)}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[value] ?? STATUS_STYLES.cancelled}`}>
        {value}
      </span>
    ),
  },
  {
    key: "createdAt",
    header: "Date",
    render: (value: string) => (
      <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(value)}</span>
    ),
  },
];

interface Props {
  payments: RecentPayment[];
}

const RecentPaymentsTable: React.FC<Props> = ({ payments }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-indigo-100 dark:border-gray-700 overflow-hidden">
    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
      <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">
        Recent Payments
      </h2>
    </div>
    <ReusableTable title="" columns={columns} data={payments} />
  </div>
);

export default RecentPaymentsTable;