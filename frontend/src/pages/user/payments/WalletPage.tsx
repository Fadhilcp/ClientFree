import React, { useEffect, useState } from "react";
import ListWithHeader from "../../../components/user/ListWithHeader";
import WalletCard from "../../../components/user/wallet/WalletCard";
import { walletService } from "../../../services/wallet.service";
import { notify } from "../../../utils/toastService";
import Pagination from "../../../components/user/Pagination";
import Loader from "../../../components/ui/Loader/Loader";

const WalletPage: React.FC = () => {
  const [balance, setBalance] = useState<{ available: number; escrow: number; pending: number; currency: string }>();
  const [transactions, setTransactions] = useState<any[]>([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(10); 
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0) ;

  const fetchWallet = async (pageNumber: number) => {
    try {
      setLoading(true);

      const response = await walletService.getWalletDetails(pageNumber, limit);

      if(response.data.success){
        const { balance, transactions, total, page, totalPages } = response.data;
        setBalance(balance);
        setTransactions(transactions);
        setTotal(total);
        setPage(page);
        setTotalPages(totalPages);
      }
    } catch (error: any) {
      notify.error(error.response?.data?.error || "Failed to load wallet");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWallet(1);
  }, [limit]);

  return (
    <div className="container mx-auto">
      { loading && <Loader/> }
      {/* Page Header */}
      <header className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-500">
          Wallet
        </h2>
      </header>

      {/* Main Content */}
      <main className="space-y-8">
        {/* Wallet Summary */}
        {balance && (
          <section>
            <WalletCard
              balance={balance.available}
              currency={balance.currency}
              transactions={transactions.map((tx) => ({
                id: tx.id,
                label: tx.type === "credit" ? "Credit" : "Debit",
                amount: tx.amount,
                type: tx.type,
              }))}
            />
          </section>
        )}

        {/* Transactions List */}
        <section>
          <ListWithHeader
            title="Recent Transactions"
            items={transactions}
            columns={[
              { key: "direction", header: "Direction" },
              { key: "createdAt", header: "Date", render: (val) => new Date(val).toLocaleString() },
              { key: "status", header: "Status", render: (val) => (
                  <span
                    className={
                      val === "completed"
                        ? "text-green-600"
                        : val === "pending"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }
                  >
                    {val}
                  </span>
                )
              },
              { key: "amount", header: "Amount", render: (val, item) => (
                  <span className={item.direction === "credit" ? "text-green-600" : "text-red-600"}>
                    {item.direction === "credit" ? "+" : "-"} {item.currency} {val}
                  </span>
                )
              },
              { key: "balanceAfter", header: "Balance After", render: (val) => (
                `${val.currency ?? ""} ${val.available}`
              ) },
            ]}
          />

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            entityLabel="transactions"
            onPageChange={(newPage) => fetchWallet(newPage)}
          />

        </section>
      </main>
    </div>
  );
};

export default WalletPage;