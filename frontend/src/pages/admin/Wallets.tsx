import React, { useEffect, useState } from 'react';
import SearchFilter from '../../components/admin/SearchFilter';
import ReusableTable from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader/Loader';

import { notify } from '../../utils/toastService';
import { walletService } from '../../services/wallet.service';
import { useNavigate } from 'react-router-dom';

export interface WalletDTO {
  id: string;

  currency: string;
  status: "active" | "suspended";
  role: "client" | "freelancer" | "admin";

  balance: {
    available: number;
    escrow: number;
    pending: number;
  };

  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };

  createdAt?: Date;
  updatedAt?: Date;
}


export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
}

const Wallets = () => {
  const [wallets, setWallets] = useState<WalletDTO[]>([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const res = await walletService.getAllUserWallets(search, page, limit);

      if (res.data.success) {
        const { data, totalPages } = res.data.wallets;
        setWallets(data);
        setTotalPages(totalPages);
      }
    } catch (err: any) {
      notify.error(err.response?.data?.error || 'Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchWallets, 500);
    return () => clearTimeout(delay);
  }, [page, search]);

    const columns: Column<WalletDTO>[] = [
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
            key: 'balance',
            header: 'Balance',
            render: (_, row) => (
            <div className="text-xs text-gray-500 space-y-1">
                <div>
                Available: {row.currency} {row.balance.available}
                </div>
                <div>
                Escrow: {row.currency} {row.balance.escrow}
                </div>
                <div>
                Pending: {row.currency} {row.balance.pending}
                </div>
            </div>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (val) => (
            <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                val === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
            >
                {val}
            </span>
            ),
        },
        {
            key: 'id',
            header: 'Actions',
            render: (_, row) => (
            <Button
                label="View Transactions"
                onClick={() => navigate(`/admin/wallets/${row.id}/transactions`)}
                className="px-3 py-1 text-xs font-medium text-indigo-600 
                border border-indigo-600 rounded hover:bg-indigo-50"
            />
            ),
        },
    ];


  return (
    <>
      {loading && <Loader />}
      <div className="p-4 bg-white dark:bg-gray-900 min-h-screen">
        <h1 className="text-xl font-semibold mb-4">Wallets</h1>

        <SearchFilter search={search} onSearchChange={setSearch} />

        <ReusableTable
          title="User Wallets"
          columns={columns}
          data={wallets}
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

export default Wallets;
