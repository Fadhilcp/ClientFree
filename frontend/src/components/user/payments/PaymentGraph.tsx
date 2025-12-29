import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  BarChart,
  Bar
} from "recharts";

interface Props {
  data: any[];
}

const PaymentGraph: React.FC<Props> = ({ data }) => {
    const isClientGraph = data.some(item => "type" in item);

    const grouped = Object.values(
        data.reduce((acc: any, item) => {
        const key = `${item.month}-${item.year}`;

        if (!acc[key]) {
            acc[key] = {
            label: `${item.month}/${item.year}`,
            escrow_hold: 0,
            escrow_release: 0,
            earnings: 0
            };
        }

        if ("type" in item) {
            acc[key][item.type] = item.total;
        } else {
            acc[key].earnings += item.total;
        }

        return acc;
        }, {})
    );


return (
  <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow-md">
    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
      Escrow Payments Overview
    </h3>
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={grouped}
        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
      >
        {/* Grid */}
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e5e7eb"
          className="dark:stroke-gray-700"
        />

        {/* Axes */}
        <XAxis
          dataKey="label"
          tick={{ fill: "#6b7280", fontSize: 12 }}
          axisLine={{ stroke: "#d1d5db" }}
        />
        <YAxis
          tick={{ fill: "#6b7280", fontSize: 12 }}
          axisLine={{ stroke: "#d1d5db" }}
        />

        {/* Tooltip */}
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "12px",
          }}
          wrapperStyle={{ color: "#111827" }}
          labelStyle={{ fontWeight: "600", color: "#374151" }}
        />

        {/* Legend */}
        <Legend
          verticalAlign="top"
          height={36}
          wrapperStyle={{ color: "#374151" }}
        />

        {/* Bars */}
        {isClientGraph ? (
            <>
                <Bar
                dataKey="escrow_hold"
                fill="#f59e0b"
                name="Escrow Hold"
                radius={[6, 6, 0, 0]}
                />
                <Bar
                dataKey="escrow_release"
                fill="#10b981"
                name="Escrow Release"
                radius={[6, 6, 0, 0]}
                />
            </>
        ) : (
            <Bar
              dataKey="earnings"
              fill="#6366f1"
              name="Earnings"
              radius={[6, 6, 0, 0]}
            />
        )}
      </BarChart>
    </ResponsiveContainer>
  </div>
);
};

export default PaymentGraph;