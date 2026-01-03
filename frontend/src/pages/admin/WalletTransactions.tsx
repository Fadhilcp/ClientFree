import { useEffect, useState } from 'react';
import ReusableTable, { type Column } from '../../components/ui/Table';
import Loader from '../../components/ui/Loader/Loader';
import Button from '../../components/ui/Button';
import { notify } from '../../utils/toastService';

import { walletService } from '../../services/wallet.service';
import Pagination from '../../components/ui/Pagination';
import SearchFilter from '../../components/admin/SearchFilter';
import { useParams } from 'react-router-dom';
import type { WalletDTO } from './Wallets';
import StatisticCard from '../../components/ui/Card/StatisticCard';

interface WalletTransactionDTO {
  id: string;

  type:
    | 'deposit'
    | 'escrow_hold'
    | 'escrow_release'
    | 'payment'
    | 'withdrawal'
    | 'refund'
    | 'fee'
    | 'admin_adjustment';

  direction: 'credit' | 'debit';

  amount: number;
  currency: string;

  balanceAfter: {
    available: number;
    escrow: number;
    pending: number;
  };

  paymentId?: string;
  status: 'completed' | 'failed';
  createdAt?: Date;
}


const WalletTransactionsPage = () => {
  const { walletId } = useParams<{ walletId: string }>();

  const [transactions, setTransactions] = useState<WalletTransactionDTO[]>([]);
  const [wallet, setWallet] = useState<WalletDTO>()
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const res = await walletService.getAllUserWalletsTransactions(
        walletId!,
        search,
        page,
        limit
      );

      if (res.data.success) {
        const { data, totalPages, wallet } = res.data.transactions;
        setTransactions(data);
        setWallet(wallet);
        setTotalPages(totalPages);
      }
    } catch (err: any) {
      notify.error(err.response?.data?.error || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchTransactions, 400);
    return () => clearTimeout(delay);
  }, [search, page, walletId]);

  const columns: Column<WalletTransactionDTO>[] = [
    {
      key: 'type',
      header: 'Type',
      render: (val) => val.replace('_', ' ').toUpperCase(),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (_, row) => (
        <span
          className={
            row.direction === 'debit'
              ? 'text-red-600 font-medium'
              : 'text-green-600 font-medium'
          }
        >
          {row.direction === 'debit' ? '-' : '+'} {row.currency} {row.amount}
        </span>
      ),
    },
    {
      key: 'balanceAfter',
      header: 'Balance After',
      render: (_, row) => (
        <div className="text-xs">
          <div>Available: {row.balanceAfter.available}</div>
          <div>Escrow: {row.balanceAfter.escrow}</div>
          <div>Pending: {row.balanceAfter.pending}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (val) => (val ? new Date(val).toLocaleString() : '—'),
    },
  ];

return (
  <div className="p-6 space-y-6">
    {/* Header */}
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-xl font-semibold">Wallet Transactions</h1>

        {wallet?.user && (
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-200">
              {wallet.user.name}
            </span>
            <span className="mx-1">•</span>
            <span>{wallet.user.email}</span>
          </div>
        )}
      </div>

      <Button label="Back" onClick={() => history.back()} />
    </div>

    {/* Statistics */}
    {wallet && (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatisticCard
          title="Available Balance"
          value={`${wallet.currency} ${wallet.balance.available}`}
        />

        <StatisticCard
          title="Escrow Balance"
          value={`${wallet.currency} ${wallet.balance.escrow}`}
        />

        <StatisticCard
          title="Pending Balance"
          value={`${wallet.currency} ${wallet.balance.pending}`}
        />
      </div>
    )}

    {/* Search */}
    <SearchFilter search={search} onSearchChange={setSearch} />

    {/* Table */}
    {loading ? (
      <Loader />
    ) : (
      <ReusableTable
        title="Transactions"
        columns={columns}
        data={transactions}
      />
    )}

    {/* Pagination */}
    <Pagination
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
    />
  </div>
);
};

export default WalletTransactionsPage;