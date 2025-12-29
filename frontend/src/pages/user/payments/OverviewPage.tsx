import React, { useEffect, useState } from "react";
import Loader from "../../../components/ui/Loader/Loader";
import StatisticCard from "../../../components/ui/Card/StatisticCard";
import ListWithHeader from "../../../components/user/ListWithHeader";
import { notify } from "../../../utils/toastService";
import { walletService } from "../../../services/wallet.service";
import PaymentGraph from "../../../components/user/payments/PaymentGraph";
import type { ClientOverview, Overview } from "../../../types/payments/overview.type";


const isClientOverview = (
  data: Overview
): data is ClientOverview => {
  return "pendingPayments" in data;
};

const OverviewPage: React.FC = () => {
  const [overview, setOverview] = useState<Overview | null>(null);

  const [loading, setLoading] = useState(false);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await walletService.getPaymentOverview();
      console.log("🚀 ~ fetchOverview ~ res:", res)

      if (res.data.success) {
        setOverview(res.data.overview);
      }
    } catch (error: any) {
      notify.error(
        error.response?.data?.error || "Failed to load overview"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const paymentGraph = overview?.paymentGraph;

  return (
    <div className="container mx-auto">
      {loading && <Loader />}

      {/* Header */}
      <header className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-500">
          Payment Overview
        </h2>
      </header>

      {/* Summary */}
    {/* Summary Cards */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatisticCard
            title="Wallet Balance"
            value={overview.walletBalance}
          />

          {isClientOverview(overview) ? (
            <>
              <StatisticCard title="Pending Payments" value={overview.pendingPayments}/>
              <StatisticCard title="Released Payments" value={overview.releasedPayments}/>
              <StatisticCard title="Upcoming Milestones" value={overview.upcomingMilestones}/>
            </>
          ) : (
            <>
              <StatisticCard title="Pending Clearance" value={overview.pendingClearance}/>
              <StatisticCard title="Total Earned" value={overview.totalEarned}/>
              <StatisticCard title="Total Withdrawn" value={overview.totalWithdrawn}/>
            </>
          )}
        </div>
      )}

      {/* Graph */}
      {paymentGraph && paymentGraph.length > 0 && (
        <div className="mb-10 bg-white dark:bg-gray-900 p-4 rounded">
          <PaymentGraph data={paymentGraph} />
        </div>
      )}

      {/* Recent Transactions */}
      <section>
        <ListWithHeader
          title="Recent Transactions"
          items={overview?.recentTransactions || []}
          columns={[
            {
              key: "type",
              header: "Type",
              render: (val) =>
                val ? val.replace("_", " ").toUpperCase() : "-"
            },
            {
              key: "amount",
              header: "Amount",
              render: (val) => `USD ${val}`
            },
            {
              key: "direction",
              header: "Direction",
              render: (val) => val.toUpperCase()
            },
            {
              key: "status",
              header: "Status",
              render: (val) => val.toUpperCase()
            },
            {
              key: "createdAt",
              header: "Date",
              render: (val) =>
                new Date(val).toLocaleString()
            }
          ]}
        />
      </section>
    </div>
  );
};

export default OverviewPage;
