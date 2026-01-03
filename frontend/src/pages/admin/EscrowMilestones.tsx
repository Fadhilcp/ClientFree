import React, { useEffect, useState } from 'react';
import SearchFilter from '../../components/admin/SearchFilter';
import ReusableTable from '../../components/ui/Table';
import FilterTabs from '../../components/admin/FilterTabs';
import Pagination from '../../components/ui/Pagination';
import Loader from '../../components/ui/Loader/Loader';

import { notify } from '../../utils/toastService';
import { jobAssignmentService } from '../../services/jobAssignments.service';

export interface AdminEscrowMilestoneDTO {
  assignmentId: string;
  jobId: string;
  jobTitle?: string;

  milestoneId: string;
  milestoneTitle: string;
  milestoneAmount: number;
  milestoneStatus: string;
  milestoneDueDate?: Date;
  submittedAt?: Date;

  freelancer: {
    id: string;
    name: string;
    email: string;
  };

  payment?: {
    id: string;
    amount: number;
    status: string;
    provider?: string;
    referenceId?: string;
    createdAt?: Date;
  };

  createdAt: Date;
}


export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
}

const escrowTabs = ['All', 'Funded', 'Released'];

const EscrowMilestones = () => {
  const [milestones, setMilestones] = useState<AdminEscrowMilestoneDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEscrowMilestones = async () => {
    try {
      setLoading(true);
      const res = await jobAssignmentService.getAllEscrowMilestones(search, page, limit);

      if (res.data.success) {
        const { data, totalPages } = res.data.milestones;
        setMilestones(data);
        setTotalPages(totalPages);
      }
    } catch (err: any) {
      notify.error(err.response?.data?.error || 'Failed to load escrow milestones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchEscrowMilestones, 500);
    return () => clearTimeout(delay);
  }, [page, search]);

  const filteredData = milestones.filter((m) => {
    if (activeTab === 'All') return true;
    return m.milestoneStatus.toLowerCase() === activeTab.toLowerCase();
  });

  const columns: Column<AdminEscrowMilestoneDTO>[] = [
    {
        key: 'milestoneTitle',
        header: 'Milestone',
        render: (_, row) => (
        <div className="text-sm">
            <div className="font-medium">{row.milestoneTitle}</div>
            {row.jobTitle && (
            <div className="text-gray-400">Job: {row.jobTitle}</div>
            )}
        </div>
        ),
    },
    {
        key: 'freelancer',
        header: 'Freelancer',
        render: (_, row) => (
        <div className="text-sm">
            <div className="font-medium">{row.freelancer.name}</div>
            <div className="text-gray-400">{row.freelancer.email}</div>
        </div>
        ),
    },
    {
        key: 'milestoneAmount',
        header: 'Amount',
        render: (val) => (
        <span className="font-medium text-gray-100">
            ₹ {val}
        </span>
        ),
    },
    {
        key: 'milestoneStatus',
        header: 'Status',
        render: (value: string) => (
        <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
            value === 'released'
                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
            }`}
        >
            {value}
        </span>
        ),
    },
    {
        key: 'createdAt',
        header: 'Funded At',
        render: (val) => new Date(val).toLocaleString(),
    },
 ];

  return (
    <>
      {loading && <Loader />}

      <div className="p-4 bg-white dark:bg-gray-900 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Escrow Milestones
          </h1>
        </div>

        <SearchFilter search={search} onSearchChange={setSearch} />
        <FilterTabs tabs={escrowTabs} activeTab={activeTab} onChange={setActiveTab} />

        <ReusableTable
          title="Escrow Milestones"
          columns={columns}
          data={filteredData}
        />

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </>
  );
};

export default EscrowMilestones;
