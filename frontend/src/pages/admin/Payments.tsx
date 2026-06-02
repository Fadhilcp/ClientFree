import React, { useEffect, useState } from "react";
import SearchFilter from "../../components/admin/SearchFilter";
import ReusableTable from "../../components/ui/Table";
import FilterTabs from "../../components/admin/FilterTabs";
import Pagination from "../../components/ui/Pagination";
import Loader from "../../components/ui/Loader/Loader";

import { notify } from "../../utils/toastService";
import { paymentService } from "../../services/payment.service";

// types/admin/AdminPayment.dto.ts
export interface AdminPaymentDto {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  provider?: string;
  method?: string;
  referenceId?: string;
  createdAt: string;

  user?: {
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

const paymentTabs = ["All", "Completed", "Pending", "Failed", "Cancelled"];

const Payments = () => {
  const [payments, setPayments] = useState<AdminPaymentDto[]>([]);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await paymentService.getAllPayments(search, page, limit);

      if (res.data.success) {
        const { data, totalPages } = res.data.payments;
        setPayments(data);
        setTotalPages(totalPages);
      }
    } catch (err: any) {
      notify.error(err.response?.data?.error || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchPayments, 500);
    return () => clearTimeout(delay);
  }, [page, search]);

  const filteredPayments = payments.filter((p) => {
    if (activeTab === "All") return true;
    return p.status === activeTab.toLowerCase();
  });

  const columns: Column<AdminPaymentDto>[] = [
    {
      key: "id",
      header: "Reference",
      render: (_, row) =>
        row.referenceId ?? `PAY-${row.id.slice(-6).toUpperCase()}`,
    },
    {
      key: "amount",
      header: "Amount",
      render: (val, row) => (
        <span className="font-medium">
          {row.currency} {val}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (val) => val.toUpperCase(),
    },
    {
      key: "status",
      header: "Status",
      render: (value: string) => (
        
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            value === "completed"
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : value === "pending"
              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          {value.replace("_", " ").toUpperCase()}
        </span>
      ),
    },
    {
      key: "user",
      header: "User",
      render: (_, row) =>
        row.user ? (
          <div>
            <div className="font-medium">{row.user.name}</div>
            <div className="text-xs text-gray-400">{row.user.email}</div>
          </div>
        ) : (
          "-"
        ),
    },
    {
      key: "createdAt",
      header: "Date",
      render: (val) => new Date(val).toLocaleString(),
    },
  ];

  return (
    <>
      {loading && <Loader />}

      <div className="p-4 bg-white dark:bg-gray-900 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Payments
          </h1>
        </div>

        <SearchFilter search={search} onSearchChange={setSearch} />
        <FilterTabs tabs={paymentTabs} activeTab={activeTab} onChange={setActiveTab} />

        <ReusableTable title="Payment Listing" columns={columns} data={filteredPayments} />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </>
  );
};

export default Payments;
