import React, { useEffect, useState } from 'react';
import SearchFilter from '../../components/admin/SearchFilter';
import ReusableTable from '../../components/ui/Table';
import FilterTabs from '../../components/admin/FilterTabs';

import { notify } from '../../utils/toastService';
import Pagination from '../../components/ui/Pagination';
import Loader from '../../components/ui/Loader/Loader';

import { paymentService } from '../../services/payment.service';

export interface AdminWithdrawalDTO {
  id: string;

  amount: number;
  currency: string;

  status: string;
  provider: string;
  method?: string;

  referenceId?: string;
  providerPaymentId?: string;

  requestedAt: string;
  processedAt?: string;

  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
}

const withdrawalTabs = ['All', 'Pending', 'Completed', 'Failed'];

const Withdrawals: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawalDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await paymentService.getAdminWithdrawals(search, page, limit);

      if (res.data.success) {
        const { withdrawals } = res.data;
        setWithdrawals(withdrawals.data);
        setTotalPages(withdrawals.totalPages);
      }
    } catch (err: any) {
      notify.error(err.response?.data?.error || 'Failed to load withdrawals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchWithdrawals, 500);
    return () => clearTimeout(delay);
  }, [page, search]);

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (activeTab === 'All') return true;
    return w.status.toLowerCase() === activeTab.toLowerCase();
  });

  // table columns
  const columns: Column<AdminWithdrawalDTO>[] = [
    {
      key: 'referenceId',
      header: 'Reference',
      render: (val) => val ?? '—',
    },
    {
      key: 'user',
      header: 'User',
      render: (_, row) => (
        <div className="text-sm">
          <div className="font-medium">{row.user.name}</div>
          <div className="text-gray-400">{row.user.email}</div>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (_, row) => (
        <span className="font-medium text-red-600">
          - {row.currency} {row.amount}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            value === 'completed'
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : value === 'pending'
              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'requestedAt',
      header: 'Requested At',
      render: (val) => new Date(val).toLocaleString(),
    },
  ];

  return (
    <>
      {loading && <Loader />}

      <div className="p-4 bg-white dark:bg-gray-900 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Withdrawals
          </h1>
        </div>

        <SearchFilter search={search} onSearchChange={setSearch} />
        <FilterTabs
          tabs={withdrawalTabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <ReusableTable
          title="Withdrawal Requests"
          columns={columns}
          data={filteredWithdrawals}
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

export default Withdrawals;
