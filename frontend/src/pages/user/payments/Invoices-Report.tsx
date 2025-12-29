import React, { useEffect, useState } from "react";
import ListWithHeader from "../../../components/user/ListWithHeader";
import { walletService } from "../../../services/wallet.service";
import { notify } from "../../../utils/toastService";
import Pagination from "../../../components/user/Pagination";
import Loader from "../../../components/ui/Loader/Loader";
import StatisticCard from "../../../components/ui/Card/StatisticCard";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import InputSection from "../../../components/ui/InputSection";

// to get default date for report
const getToday = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

const getStartOfMonth = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().split("T")[0];
};


const InvoicesAndReportsPage: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [from, setFrom] = useState<string>(getStartOfMonth());
  const [to, setTo] = useState<string>(getToday());
  const [report, setReport] = useState<any>(null);


  const role = useSelector((state: RootState) => state.auth.user?.role);


  const fetchInvoices = async (pageNumber: number) => {
    try {
      setLoading(true);

      const res = await walletService.getInvoices(pageNumber, limit);


      if (res.data.success) {
        const { invoices, page, totalPages, total } = res.data;
        setInvoices(invoices);
        setPage(page);
        setTotal(total);
        setTotalPages(totalPages);
      }
    } catch (error: any) {
      notify.error(error.response?.data?.error || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const fetchReport = async () => {
    if (!from || !to) return;

    const res = await walletService.getReport(from, to);
    if (res.data.success) {
      const { summary } = res.data.report;
      setReport(summary);
    }
  };

  useEffect(() => {
    fetchInvoices(1);
  }, []);

  useEffect(() => {
    fetchReport();
  }, [from, to])

    const downloadInvoice = async (transactionId: string) => {
      try {
          const response = await walletService.downloadInvoice(transactionId);

          const blob = new Blob([response.data], {
              type: "application/pdf"
          });

          const url = window.URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = url;
          link.download = `invoice-${transactionId}.pdf`;

          document.body.appendChild(link);
          link.click();

          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
      } catch (error: any) {
          notify.error(
              error.response?.data?.error || "Failed to download invoice"
          );
      }
    };


  return (
    <div className="container mx-auto">
      {loading && <Loader />}

      {/* Page Header */}
      <header className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-500">
          Invoices & Reports
        </h2>
        {/* Date Filters */}
        <div className="flex flex-wrap gap-4 max-w-xl">
          <div className="flex-1 min-w-[150px]">
            <InputSection name="from" label="From" type="date" value={from || ""} 
            onChange={(val: string) => setFrom(val)}
            className="w-full border rounded-lg px-3 py-2 text-sm
                        focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                        dark:bg-gray-800 dark:text-gray-200"
            />
          </div>

          <div className="flex-1 min-w-[150px]">
            <InputSection name="to" label="To" type="date" value={to || ""} 
            onChange={(val: string) => setTo(val)}
            className="w-full border rounded-lg px-3 py-2 text-sm
                        focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                        dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      {report && role === "freelancer" && (
        <>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatisticCard title="Total Earned" value={report.freelancer.totalEarned} />
            <StatisticCard title="In Escrow" value={report.inEscrow} />
            <StatisticCard title="Withdrawn" value={report.freelancer.withdrawn} />
            <StatisticCard title="Platform Fees" value={report.freelancer.platformFees} />
          </div>
        </>
      )}

      {report && role === "client" && (
        <>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatisticCard title="Total Spent" value={report.client.totalSpent} />
            <StatisticCard title="Active Escrow" value={report.inEscrow} />
            <StatisticCard title="Refunded" value={report.client.refunded} />
          </div>
        </>
      )}

      <section>
        <ListWithHeader
            title="All Invoices"
            items={invoices}
            columns={[
                {
                    key: "id",
                    header: "Invoice #",
                    render: (val) => `INV-${val.slice(-6).toUpperCase()}`
                },
                {
                    key: "type",
                    header: "Type",
                    render: (val) =>
                        val.replace("_", " ").toUpperCase()
                },
                {
                    key: "amount",
                    header: "Amount",
                    render: (val, item) => (
                        <span
                        className={
                            item.direction === "credit"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                        >
                        {item.direction === "credit" ? "+" : "-"}{" "}
                        {item.currency} {val}
                        </span>
                    )
                },
                {
                    key: "status",
                    header: "Status",
                    render: (val) => val.toUpperCase()
                },
                {
                    key: "createdAt",
                    header: "Date",
                    render: (val) => new Date(val).toLocaleString()
                },
                {
                    key: "id",
                    header: "Download",
                    render: (_, item) => (
                        <button
                        onClick={() => downloadInvoice(item.id)}
                        className="text-indigo-600 dark:text-indigo-500 hover:underline"
                        >
                        PDF
                        </button>
                    )
                }
            ]}
        />


        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          entityLabel="invoices"
          onPageChange={(newPage) => fetchInvoices(newPage)}
        />
      </section>
    </div>
  );
};

export default InvoicesAndReportsPage;
