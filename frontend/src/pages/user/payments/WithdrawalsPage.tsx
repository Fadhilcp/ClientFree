import React, { useEffect, useState } from "react";
import ListWithHeader from "../../../components/user/ListWithHeader";
import { notify } from "../../../utils/toastService";
import Pagination from "../../../components/user/Pagination";
import Loader from "../../../components/ui/Loader/Loader";
import StatisticCard from "../../../components/ui/Card/StatisticCard";
import UserModal from "../../../components/ui/Modal/UserModal";
import { paymentService } from "../../../services/payment.service";

interface WithdrawalForm {
  [key: string]: string;
  amount: string;
}

const WithdrawalsPage: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [balances, setBalances] = useState<any>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  // modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<WithdrawalForm>({ amount: "" });
  const [errors, setErrors] = useState<Partial<WithdrawalForm>>({});

  const fetchWithdrawals = async (pageNumber: number) => {
    try {
      setLoading(true);

      const res = await paymentService.getWithdrawals(pageNumber, limit);

      if (res.data.success) {
        const {
          withdrawals,
          balances,
          pagination
        } = res.data;

        setWithdrawals(withdrawals);
        setBalances(balances);
        setPage(pagination.page);
        setTotal(pagination.total);
        setTotalPages(pagination.totalPages);
      }
    } catch (error: any) {
      notify.error(
        error.response?.data?.error || "Failed to load withdrawals"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals(1);
  }, []);

  const handleChange = (field: keyof WithdrawalForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const submitWithdrawal = async ({ amount }: WithdrawalForm) => {
    const value = Number(amount);

    const validationErrors: Partial<WithdrawalForm> = {};

    if (!value || value <= 0) {
      validationErrors.amount = "Enter a valid amount";
    } else if (balances && value > balances.available) {
      validationErrors.amount = "Amount exceeds available balance";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await paymentService.withdrawAmount(value);
      notify.success("Withdrawal request submitted");

      setShowModal(false);
      setFormData({ amount: "" });
      fetchWithdrawals(1);
    } catch (error: any) {
      notify.error(error.response?.data?.error || "Withdrawal failed");
    }
  };


  return (
    <div className="container mx-auto">
      {loading && <Loader />}

      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-500">
          Withdrawals
        </h2>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Withdraw
        </button>
      </header>

      {/* Summary Cards */}
      {balances && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatisticCard
            title="Available to Withdraw"
            value={`${balances.currency} ${balances.available}`}
          />
          <StatisticCard
            title="In Escrow"
            value={`${balances.currency} ${balances.escrow}`}
          />
          <StatisticCard
            title="Pending"
            value={`${balances.currency} ${balances.pending}`}
          />
        </div>
      )}

      {/* Withdrawal History */}
      <section>
        <ListWithHeader
          title="Withdrawal History"
          items={withdrawals}
          columns={[
            {
              key: "id",
              header: "Reference",
              render: (val) => `WD-${val.slice(-6).toUpperCase()}`
            },
            {
              key: "amount",
              header: "Amount",
              render: (val, item) => (
                <span className="text-red-600">
                  - {item.currency} {val}
                </span>
              )
            },
            {
              key: "status",
              header: "Status",
              render: (val) => (
                <span className={
                  val === "completed"
                    ? "text-green-600"
                    : val === "failed"
                    ? "text-red-600"
                    : "text-yellow-600"
                }>
                  {val.toUpperCase()}
                </span>
              )
            },
            {
              key: "createdAt",
              header: "Date",
              render: (val) => new Date(val).toLocaleString()
            },
            {
              key: "withdrawalDate",
              header: "Processed At",
              render: (val) =>
                val ? new Date(val).toLocaleString() : "—"
            },
          ]}
        />

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          entityLabel="withdrawals"
          onPageChange={(newPage) => fetchWithdrawals(newPage)}
        />
      </section>

      {/* Withdraw Modal */}
      <UserModal<WithdrawalForm>
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={submitWithdrawal}
        formData={formData}
        onChange={handleChange}
        title="Withdraw Funds"
        errors={errors}
        fields={[
          {
            name: "amount",
            label: "Amount",
            type: "number",
            placeholder: "Enter amount"
          }
        ]}
      />
    </div>
  );
};

export default WithdrawalsPage;
