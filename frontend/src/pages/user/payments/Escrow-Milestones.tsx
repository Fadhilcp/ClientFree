import React, { useEffect, useState } from 'react'
import { notify } from '../../../utils/toastService';
import { walletService } from '../../../services/wallet.service';
import Loader from '../../../components/ui/Loader/Loader';
import ListWithHeader from '../../../components/user/ListWithHeader';
import Pagination from '../../../components/user/Pagination';
import StatisticCard from '../../../components/ui/Card/StatisticCard';

const EscrowAndMilestonesPage: React.FC = () => {
    
const [milestones, setMilestones] = useState<any[]>([]);
const [summary, setSummary] = useState<any>(null);

const [page, setPage] = useState(1);
const [limit] = useState(10);
const [totalPages, setTotalPages] = useState(0);
const [total, setTotal] = useState(0);
const [loading, setLoading] = useState(false);

const fetchEscrowAndMilestones = async (pageNumber: number) => {
  try {
    setLoading(true);

    const res = await walletService.getEscrowAndMilestones(
      pageNumber,
      limit
    );

    if (res.data.success) {
      const { summary, milestones, pagination } = res.data;

      setSummary(summary);
      setMilestones(milestones);

      setPage(pagination.page);
      setTotal(pagination.total);
      setTotalPages(pagination.totalPages);
    }
  } catch (error: any) {
    notify.error(
      error.response?.data?.error || "Failed to load escrow data"
    );
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchEscrowAndMilestones(1);
}, []);

  return (
    <div className="container mx-auto">
      {loading && <Loader />}

      {/* Page Header */}
      <header className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-500">
          Invoices & Reports
        </h2>
      </header>

      {/* Summary Cards */}
        {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatisticCard
                    title="Total Contract"
                    value={summary.totalContract}
                />
                <StatisticCard
                    title="Funded In Escrow"
                    value={summary.fundedInEscrow}
                />
                <StatisticCard
                    title="Released"
                    value={summary.released}
                />
                <StatisticCard
                    title="Remaining"
                    value={summary.remaining}
                />
            </div>
        )}

      <section>
        <ListWithHeader
            title="Milestones"
            items={milestones}
            columns={[
                {
                    key: "jobTitle",
                    header: "Job"
                },
                {
                    key: "title",
                    header: "Milestone"
                },
                {
                    key: "amount",
                    header: "Amount",
                    render: (val) => `USD ${val}`
                },
                {
                    key: "status",
                    header: "Status",
                    render: (val) => val.replace("_", " ").toUpperCase()
                },
                {
                    key: "dueDate",
                    header: "Due Date",
                    render: (val) =>
                        val ? new Date(val).toLocaleDateString() : "-"
                },
                {
                    key: "submittedAt",
                    header: "Submitted",
                    render: (val) => 
                        val ? new Date(val).toLocaleString() : "-"
                }
            ]}
        />

        {/* Pagination */}
        <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            entityLabel="milestones"
            onPageChange={(newPage) =>
                fetchEscrowAndMilestones(newPage)
            }
        />
      </section>
    </div>
  );
}

export default EscrowAndMilestonesPage;
