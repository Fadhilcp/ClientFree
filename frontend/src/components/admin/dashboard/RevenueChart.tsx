import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { RevenueGraphPoint } from "../../../types/admin/adminDashboard.type";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const formatCurrency = (value: any) => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const numericValue = typeof rawValue === "number" ? rawValue : Number(rawValue) || 0;

  return new Intl.NumberFormat("en-IN", { 
    style: "currency", 
    currency: "INR", 
    maximumFractionDigits: 0 
  }).format(numericValue);
};

interface Props {
  data: RevenueGraphPoint[];
}

const RevenueChart: React.FC<Props> = ({ data }) => {
  const chartData = data.map((d) => ({
    name: `${MONTH_NAMES[d.month - 1]} ${d.year}`,
    Commission: d.commission,
    Subscription: d.subscription,
    "Add-On": d.addOn,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border border-indigo-100 dark:border-gray-700">
      <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">
        Revenue Breakdown — Last 6 Months
      </h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tickFormatter={(v) => `₹${v / 1000}k`}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value) => formatCurrency(value)}
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "none",
              borderRadius: "8px",
              color: "#f9fafb",
              fontSize: "13px",
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: "13px", paddingTop: "12px" }}
            iconType="circle"
          />
          <Bar dataKey="Commission"   stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} />
          <Bar dataKey="Subscription" stackId="a" fill="#22d3ee" radius={[0, 0, 0, 0]} />
          <Bar dataKey="Add-On"       stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;