import React, { useEffect, useState } from "react";
import SearchFilter from "../../../components/admin/SearchFilter";
import ReusableTable from "../../../components/ui/Table";
import FilterTabs from "../../../components/admin/FilterTabs";
import Button from "../../../components/ui/Button";

import { notify } from "../../../utils/toastService";
import Pagination from "../../../components/ui/Pagination";
import ConfirmationModal from "../../../components/ui/Modal/ConfirmationModal";

import type { AdminDisputeDto } from "../../../types/admin/Dispute.type";
import { paymentService } from "../../../services/payment.service";
import Loader from "../../../components/ui/Loader/Loader";
import { useNavigate } from "react-router-dom";

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
}

const disputeTabs: string[] = ["All", "Disputed", "Resolved"];

const DisputesPage = () => {
  const [disputes, setDisputes] = useState<AdminDisputeDto[]>([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const [selectedDispute, setSelectedDispute] = useState<AdminDisputeDto | null>(null);
  const [resolveModal, setResolveModal] = useState(false);

  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10); 
  const [totalPages, setTotalPages] = useState(1);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const res = await paymentService.getDisputes(search, page, limit);
      if(res.data.success){
        const { disputes } = res.data;
        if(res.data.success){
          setDisputes(disputes.data);
          setTotalPages(disputes.totalPages);
        }
      }
    } catch (err: any) {
      notify.error(err.response?.data?.error || "Failed to load disputes");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmResolve = async () => {
    if (!selectedDispute) return;

    try {
    //   await jobAssignmentService.resolveDispute(selectedDispute.id);
    //   notify.success("Dispute resolved successfully");
    //   fetchDisputes();
    } catch (err: any) {
      notify.error(err.response?.data?.error || "Failed to resolve dispute");
    }

    setResolveModal(false);
    setSelectedDispute(null);
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchDisputes();
    }, 500);
    return () => clearTimeout(delay);
  }, [page, search]);

  const filteredDisputes = disputes.filter((dispute) => {
    if (activeTab === "All") return true;
    if (activeTab === "Disputed") return dispute.status === "disputed";
    if (activeTab === "Resolved") return dispute.status === "resolved";
    return true;
  });

  const handleViewDetails = (paymentId: string) => {
    navigate(`/admin/dispute/${paymentId}`);
  };

  // table columns
  const columns: Column<AdminDisputeDto>[] = [
    { key: "job", header: "Job", render: (_, row) => row.job?.title },
    { key: "amount", header: "Amount", render: (_value, row) => `₹ ${row.amount}` },
    { key: "raisedBy", header: "Raised By", render: (_, row) => row.raisedBy?.name},
    { key: "disputeReason", header: "Reason" },
    {
      key: "status",
      header: "Status",
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            value === "disputed"
              ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
              : value === "resolved"
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "id",
      header: "Actions",
      render: (_, row) =>
        <div className=" gap-2">
          <Button
            label="View"
            onClick={() => handleViewDetails(row.id)}
            className="mx-1 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 
              bg-transparent border border-indigo-600 dark:border-indigo-400 rounded 
              hover:bg-indigo-50 dark:bg-transparent dark:hover:bg-indigo-900"
          />
        </div>
    },
  ];

  return (
    <>
    { loading && <Loader/> }

      {/* Resolve confirmation modal */}
      <ConfirmationModal
        isOpen={resolveModal}
        title="Confirm Resolve"
        description={`Are you sure you want to resolve dispute for job "${selectedDispute?.job!.title}"?`}
        onCancel={() => setResolveModal(false)}
        onConfirm={handleConfirmResolve}
      />

      <div className="p-4 bg-white dark:bg-gray-900 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Disputes Management
          </h1>
        </div>

        <SearchFilter search={search} onSearchChange={setSearch} />
        <FilterTabs tabs={disputeTabs} activeTab={activeTab} onChange={setActiveTab} />

        <ReusableTable title="Dispute Listing" columns={columns} data={filteredDisputes} />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </>
  );
};

export default DisputesPage;