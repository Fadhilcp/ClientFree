import React from "react";
import ReusableTable from "../../ui/Table";
import type { RecentUser } from "../../../types/admin/adminDashboard.type";
import type { Column } from "../../../pages/admin/AddOns"; 

const ROLE_STYLES: Record<string, string> = {
  client:     "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  freelancer: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  admin:      "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const STATUS_STYLES: Record<string, string> = {
  active:   "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  banned:   "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const columns: Column<RecentUser>[] = [
  {
    key: "username",
    header: "Username",
    render: (value: string) => (
      <span className="font-medium text-gray-800 dark:text-gray-100">{value}</span>
    ),
  },
  {
    key: "email",
    header: "Email",
    render: (value: string) => (
      <span className="text-sm text-gray-500 dark:text-gray-400">{value}</span>
    ),
  },
  {
    key: "role",
    header: "Role",
    render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${ROLE_STYLES[value] ?? ""}`}>
        {value}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[value] ?? ""}`}>
        {value}
      </span>
    ),
  },
  {
    key: "isVerified",
    header: "Verified",
    render: (value: boolean) => (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
        value
          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
      }`}>
        {value ? "Yes" : "No"}
      </span>
    ),
  },
  {
    key: "createdAt",
    header: "Joined",
    render: (value: string) => (
      <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(value)}</span>
    ),
  },
];

interface Props {
  users: RecentUser[];
}

const RecentUsersTable: React.FC<Props> = ({ users }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-indigo-100 dark:border-gray-700 overflow-hidden">
    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
      <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">
        Recently Joined Users
      </h2>
    </div>
    <ReusableTable title="" columns={columns} data={users} />
  </div>
);

export default RecentUsersTable;