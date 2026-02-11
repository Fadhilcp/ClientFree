import React, { useEffect, useState } from 'react';
import SearchFilter from '../../components/admin/SearchFilter';
import ReusableTable from '../../components/ui/Table';
import FilterTabs from '../../components/admin/FilterTabs';
import Button from '../../components/ui/Button';

import { notify } from '../../utils/toastService';
import Pagination from '../../components/ui/Pagination';
import ConfirmationModal from '../../components/ui/Modal/ConfirmationModal';

import { jobAssignmentService } from '../../services/jobAssignments.service';
import { paymentService } from '../../services/payment.service';
import type { AdminApprovedMilestoneDto } from '../../types/admin/ApprovedMilestone.type';
import Loader from '../../components/ui/Loader/Loader';
import { useNavigate } from 'react-router-dom';

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
}

const milestoneTabs: string[] = ['All', 'Approved', 'Released'];

const MilestonePayouts = () => {
  const [milestones, setMilestones] = useState<AdminApprovedMilestoneDto[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedMilestone, setSelectedMilestone] = useState<AdminApprovedMilestoneDto | null>(null);
  const [releaseModal, setReleaseModal] = useState(false);

  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [limit] = useState(10); 
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const res = await jobAssignmentService.getApprovedMilestone(search, page, limit);
      if(res.data.success){
        const { milestones } = res.data;
        setMilestones(milestones.data);
        setTotalPages(milestones.totalPages);
      }
    } catch (err: any) {
      notify.error(err.response?.data?.error || 'Failed to load milestones');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRelease = async () => {
    if (!selectedMilestone) return;

    try {
      await paymentService.releaseMilestone(selectedMilestone.paymentId!);
      notify.success('Funds released successfully');
      fetchMilestones();
    } catch (err: any) {
      notify.error(err.response?.data?.error || 'Release failed');
    }

    setReleaseModal(false);
    setSelectedMilestone(null);
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchMilestones();
    }, 500);
    return () => clearTimeout(delay);
  }, [page, search]);

  const filteredMilestones = milestones.filter((milestone) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Approved') return milestone.status === 'approved';
    if (activeTab === 'Released') return milestone.status === 'released';
    return true;
  });

  const handleReleaseClick = (m: AdminApprovedMilestoneDto) => {
    setSelectedMilestone(m);
    setReleaseModal(true);
  };

  const handleViewDetail = (m: AdminApprovedMilestoneDto) => {
    navigate(`/admin/payouts/${m.assignmentId}/${m.milestoneId}`)
  }

  // table columns
  const columns: Column<AdminApprovedMilestoneDto>[] = [
    { key: 'title', header: 'Milestone' },
    { key: 'amount', header: 'Amount' },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            value === 'approved'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
              : value === 'released'
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, row) =>
        <span>
          {
            row.status === 'approved' ? (
              <Button
                label="Release"
                onClick={() => handleReleaseClick(row)}
                className="mx-1 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 
                  bg-transparent border border-indigo-600 dark:border-indigo-400 rounded 
                  hover:bg-indigo-50 dark:bg-transparent dark:hover:bg-indigo-900"
              />
            ) : null
          }
          <Button
            label="View"
            onClick={() => handleViewDetail(row)}
            className="mx-1 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 
              bg-transparent border border-indigo-600 dark:border-indigo-400 rounded 
              hover:bg-indigo-50 dark:bg-transparent dark:hover:bg-indigo-900"
          />
        </span>
    },
  ];

  return (
    <>
    { loading && <Loader/> }
      {/* Release confirmation modal */}
      <ConfirmationModal
        isOpen={releaseModal}
        title="Confirm Release"
        description={`Are you sure you want to release funds for milestone "${selectedMilestone?.title}"?`}
        onCancel={() => setReleaseModal(false)}
        onConfirm={handleConfirmRelease}
      />

      <div className="p-4 bg-white dark:bg-gray-900 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Milestone Payouts
          </h1>
        </div>

        <SearchFilter search={search} onSearchChange={setSearch} />
        <FilterTabs tabs={milestoneTabs} activeTab={activeTab} onChange={setActiveTab} />

        <ReusableTable title="Milestone Listing" columns={columns} data={filteredMilestones} />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </>
  );
};

export default MilestonePayouts;