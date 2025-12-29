import React, { useEffect, useState } from "react";
import ListWithHeader from "../../../components/user/ListWithHeader";
import { walletService } from "../../../services/wallet.service";
import { notify } from "../../../utils/toastService";
import Pagination from "../../../components/user/Pagination";
import Loader from "../../../components/ui/Loader/Loader";

const InEscrowPage: React.FC = () => {
  const [escrowBalance, setEscrowBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("INR");
  const [transactions, setTransactions] = useState<any[]>([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchEscrow = async (pageNumber: number) => {
    try {
      setLoading(true);

      const res = await walletService.getEscrowDetails(pageNumber, limit);

      if (res.data.success) {
        const {
          escrowBalance,
          currency,
          transactions,
          page,
          totalPages,
          total
        } = res.data;

        setEscrowBalance(escrowBalance);
        setCurrency(currency);
        setTransactions(transactions);
        setPage(page);
        setTotal(total);
        setTotalPages(totalPages);
      }
    } catch (error: any) {
      notify.error(error.response?.data?.error || "Failed to load escrow data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscrow(1);
  }, []);

  return (
    <div className="container mx-auto space-y-6">
      { loading && <Loader/> }
      {/* Header */}
      <header>
        <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-500">
          In Escrow
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Funds currently held in escrow
        </p>
      </header>

      {/* Escrow Summary */}
      <section className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <p className="text-sm text-gray-500">Total in Escrow</p>
        <p className="text-2xl font-semibold">
          {currency} {escrowBalance}
        </p>
      </section>

      {/* Escrow Transactions */}
      <section>
        <ListWithHeader
          title="Escrow Transactions"
          items={transactions}
          columns={[
            { key: "createdAt", header: "Date", render: (val) => new Date(val).toLocaleString() },
            { key: "amount", header: "Amount", render: (val, item) => (
              <span className="text-red-600">
                - {item.currency} {val}
              </span>
            )},
            { key: "status", header: "Status" }
          ]}
        />

        {/* Pagination */}
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            entityLabel="transactions"
            onPageChange={(newPage) => fetchEscrow(newPage)}
          />
      </section>
    </div>
  );
};

export default InEscrowPage;
