import React, { useEffect, useState } from "react";
import ListWithHeader from "../../../components/user/ListWithHeader";
import { walletService } from "../../../services/wallet.service";
import { notify } from "../../../utils/toastService";
import Pagination from "../../../components/user/Pagination";
import Loader from "../../../components/ui/Loader/Loader";

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async (pageNumber: number) => {
    try {
      setLoading(true);
      const res = await walletService.getTransactions(pageNumber, limit);

      if (res.data.success) {
        const { transactions, page, totalPages, total } = res.data;
        setTransactions(transactions);
        setPage(page);
        setTotal(total);
        setTotalPages(totalPages);
      }
    } catch (error: any) {
      notify.error(error.response?.data?.error || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1);
  }, []);

  return (
    <div className="container mx-auto">
      { loading && <Loader/> }
      {/* Page Header */}
      <header className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-500">
          Transactions
        </h2>
      </header>

     <section>
       <ListWithHeader
        title="All Transactions"
        items={transactions}
        columns={[
          { key: "type", header: "Type" },
          { key: "direction", header: "Direction" },
          {
            key: "amount",
            header: "Amount",
            render: (val, item) => (
              <span className={item.direction === "credit" ? "text-green-600" : "text-red-600"}>
                {item.direction === "credit" ? "+" : "-"} {item.currency} {val}
              </span>
            )
          },
          { key: "status", header: "Status" },
          {
            key: "createdAt",
            header: "Date",
            render: (val) => new Date(val).toLocaleString()
          }
        ]}
      />

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        entityLabel="transactions"
        onPageChange={(newPage) => fetchTransactions(newPage)}
      />
     </section>
    </div>
  );
};

export default TransactionsPage;
