import React, { useEffect, useState } from 'react';
import SearchFilter from '../../components/admin/SearchFilter';
import ReusableTable from '../../components/ui/Table';
import FilterTabs from '../../components/admin/FilterTabs';
import Button from '../../components/ui/Button';
import AdminModal from '../../components/ui/Modal/AdminModal';
import { notify } from '../../utils/toastService';
import Pagination from '../../components/ui/Pagination';
import ConfirmationModal from '../../components/ui/Modal/ConfirmationModal';

import { capitalize } from '../../utils/formatters';
import { addOnService } from '../../services/addOns.service';
import type { AddOn, AddOnForm } from '../../types/admin/addOn.type';

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
}

const addOnTabs: string[] = ['All', 'Active', 'Inactive'];

// ===== AddOn modal dropdowns & fields - start =================
const modalFields: { name: keyof AddOnForm; label: string; placeholder: string }[] = [
  { name: "key", label: "Key", placeholder: "Unique identifier (e.g. addon_highlight)" },
  { name: "displayName", label: "Display Name", placeholder: "Enter display name" },
  { name: "description", label: "Description", placeholder: "Enter description" },
  { name: "price", label: "Price", placeholder: "Enter price" },
  { name: "sortOrder", label: "Sort Order", placeholder: "Enter sort order (default 100)" },
];

const modalDropdowns: {
  name: keyof AddOnForm;
  label?: string;
  options: string[];
}[] = [
  { name: "category", label: "Category", options: ["bid", "job", "profile"] },
  { name: "userType", label: "User Type", options: ["freelancer", "client", "both"] },
  { name: "status", label: "Status", options: ["active", "inactive"] },
];
// ===== AddOn modal dropdown fields - end =================

const AddOns = () => {
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<AddOnForm>({
    key: '',
    displayName: '',
    description: '',
    category: 'bid',
    price: 0,
    userType: 'freelancer',
    flags: { highlight: false, sealed: false, sponsored: false },
    sortOrder: 100,
    status: 'active'
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAll = () => {
    const newErrors: Record<string, string> = {};
    if (formData.key.trim() === '') {
      newErrors.key = 'Key is required.';
    }
    if (formData.displayName.trim() === '') {
      newErrors.displayName = 'Display name is required.';
    }
    if (formData.category.trim() === '') {
      newErrors.category = 'Category is required';
    }
    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    if (formData.status && !['active', 'inactive'].includes(formData.status)) {
      newErrors.status = 'Status must be active or inactive';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      key: '',
      displayName: '',
      description: '',
      category: 'bid',
      price: 0,
      userType: 'freelancer',
      flags: { highlight: false, sealed: false, sponsored: false },
      sortOrder: 100,
      status: 'active'
    });
    setErrors({});
    setModalOpen(false);
    setEditingId(null);
  };

  const handleChange = (field: keyof AddOnForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFlagChange = (flag: keyof AddOnForm["flags"], value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      flags: { ...prev.flags, [flag]: value }
    }));
  };


  // create and edit AddOn
  const handleSubmit = async () => {
    if (!validateAll()) return;
    const payload = { 
      ...formData, 
      displayName: capitalize(formData.displayName.trim()),
      isActive: formData.status === "active"
    };
    delete payload.status;
    try {
      if (editingId) {
        const response = await addOnService.updateAddOn(editingId, payload);
        if (response.data.success) notify.success("AddOn updated successfully");
      } else {
        const response = await addOnService.createAddOn(payload);
        if (response.data.success) notify.success("AddOn added successfully");
      }
      await fetchAddOns();
      resetForm();
    } catch (error: any) {
      notify.error(error.response?.data?.error || 'AddOn adding Failed, try again later');
    }
  };


  const [confirmModal, setConfirmModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!deleteId) return;
    setConfirmModal(false);
    handleDelete(deleteId);
  };

  // delete AddOn
  const handleDelete = async (id: string) => {
    try {
      const response = await addOnService.deleteAddOn(id);
      if (response.data.success) {
        notify.success("AddOn deleted successfully");
        await fetchAddOns();
      }
    } catch (error: any) {
      notify.error(error.response?.data?.error || "Failed to delete AddOn");
    }
  };
  // edit AddOn
  const handleEdit = (row: AddOn) => {
    setEditingId(row.id);
    setFormData({
      key: row.key,
      displayName: row.displayName,
      description: row.description,
      category: row.category,
      price: row.price,
      userType: row.userType,
      flags: row.flags,
      sortOrder: row.sortOrder,
      status: row.isActive ? 'active' : 'inactive'
    });
    setModalOpen(true);
  };

  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  // const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);


  const fetchAddOns = async () => {
    try {
      const response = await addOnService.getAllAddOns();
      const { addOns } = response.data;
      const mapped = addOns.map((a: any) => ({
        ...a,
        status: a.isActive ? "active" : "inactive"
      }));

      setAddOns(mapped);
      setTotalPages(addOns.totalPages);
    } catch (error: any) {
      notify.error(error.response?.data?.error || "Failed to fetch AddOns");
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchAddOns();
    }, 500);
    return () => clearTimeout(delay);
  }, [page, search]);

  const filteredAddOns = addOns.filter((addOn) => {
    if (activeTab === 'All') return true;
    return addOn.isActive === (activeTab === 'Active');
  });

  // table columns
  const columns: Column<AddOn>[] = [
    { key: 'displayName', header: 'AddOn Name' },
    { key: 'category', header: 'Category' },
    { key: 'price', header: 'Price' },
    {
      key: 'isActive',
      header: 'Status',
      render: (value: boolean) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            value
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, row) => (
        <div className="gap-2">
          <Button
            label="Edit"
            onClick={() => handleEdit(row)}
            className="mx-1 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 
            bg-transparent border border-indigo-600 dark:border-indigo-400 rounded hover:bg-indigo-50 dark:bg-transparent
            dark:hover:bg-indigo-900"
          />
          <Button
            label="Delete"
            onClick={() => {
              setDeleteId(row.id);
              setConfirmModal(true);
            }}
            className="mx-1 px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 border bg-transparent 
            border-red-600 dark:border-red-400 rounded hover:bg-red-50 dark:bg-transparent dark:hover:bg-red-900"
          />
        </div>
      ),
    },
  ];
  // ====== Columns for table - end ===================
  return (
    <>
      {/* delete AddOn confirmation modal - start */}
      <ConfirmationModal
        isOpen={confirmModal}
        title="Confirm Delete"
        description="Are you sure you want to delete this AddOn?"
        onCancel={() => {
          setConfirmModal(false);
          setDeleteId(null);
        }}
        onConfirm={() => handleConfirm()}
      />
      {/* delete AddOn confirmation modal - end */}

      {/* Add AddOn modal - start */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => resetForm()}
        onSubmit={() => handleSubmit()}
        formData={formData}
        onChange={handleChange}
        title={editingId ? "Edit AddOn" : "Add AddOn"}
        fields={modalFields}
        dropdowns={modalDropdowns}
        errors={errors}
      >
        {/* ✅ Pass checkboxes as children */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Flags
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.flags.highlight}
                onChange={(e) => handleFlagChange("highlight", e.target.checked)}
              />
              Highlight
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.flags.sealed}
                onChange={(e) => handleFlagChange("sealed", e.target.checked)}
              />
              Sealed
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.flags.sponsored}
                onChange={(e) => handleFlagChange("sponsored", e.target.checked)}
              />
              Sponsored
            </label>
          </div>
        </div>
      </AdminModal>
      {/* Add AddOn modal - end */}

      <div className="p-4 bg-white dark:bg-gray-900 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            AddOn Management
          </h1>
          <Button
            label="+Add AddOn"
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-600 rounded hover:bg-indigo-700 dark:hover:bg-indigo-700"
          />
        </div>

        <SearchFilter search={search} onSearchChange={setSearch} />
        <FilterTabs tabs={addOnTabs} activeTab={activeTab} onChange={setActiveTab} />

        <ReusableTable title="AddOn Listing" columns={columns} data={filteredAddOns} />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </>
  );

};

export default AddOns;