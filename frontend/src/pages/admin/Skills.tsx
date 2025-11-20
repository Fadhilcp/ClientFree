import React, { useEffect, useState } from 'react';
import SearchFilter from '../../components/admin/SearchFilter';
import ReusableTable from '../../components/ui/Table';
import { skillService } from '../../services/skill.service';
import FilterTabs from '../../components/admin/FilterTabs';
import Button from '../../components/ui/Button';
import AdminModal from '../../components/ui/Modal/AdminModal';
import { notify } from '../../utils/toastService';
import type { Skill, SkillForm } from '../../types/skill.types';
import { capitalize } from '../../utils/formatters';
import Pagination from '../../components/ui/Pagination';
import ConfirmationModal from '../../components/ui/Modal/ConfirmationModal';

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
}

const skillTabs: string[] = ['All', 'Active', 'Inactive'];
// ===== Add skill modal dropdowns & fields - start =================

const modalFields: { name: keyof SkillForm; label: string; placeholder: string; }[] = [
  { name: 'name', label: 'Skill Name', placeholder: 'Enter skill name' },
]

const modalDropdowns: {
  name: keyof SkillForm; label?: string; options: string[];
}[] = [
  { name: 'category', label: 'Category', options: [
    "Frontend",
    "Backend",
    "Full-Stack",
    "Mobile Development",
    "DevOps",
    "Data & AI",
    "Cybersecurity",
    "Blockchain",
    "Design",
    "QA & Testing",
    "Game Development",
    "Product & Management"
  ] },
      { name: 'status', label: 'Status', options: ['active', 'inactive'] },
    ]
    // ===== Add skill modal dropdown fields - end =================
const Skills = () => {
  // ====== Add skill modal - start =============================
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<SkillForm>({
    name: '',
    category: '',
    status: 'active'
  })
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateAll = () => {
    const newErrors: Record<string, string> = {};

    if (formData.name.trim() === '') {
      newErrors.name = 'Skill name is required.';
    }else if(formData.name.trim().length < 3){
      newErrors.name = 'Skill name must be at least 3 characters long.'
    }

    if (formData.category.trim() === '') {
      newErrors.category = 'Category is required';
    }

    if (!['active', 'inactive'].includes(formData.status)) {
      newErrors.status = 'Status must be active or inactive';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((msg) => msg === '');
  };
  
  const resetForm = () => {
    setFormData((prev) => ({...prev, name: '', category: ''}));
    
    setErrors({});
    setModalOpen(false);
  };

  const handleChange = (field: keyof SkillForm, value: string) => {
    setFormData((prev) => ({...prev, [field]: value}));
  }

  // create and edit skill submiting
  const handleSubmit = async() => {
    if(!validateAll()) return;

    const payload = {
      ...formData,
      name: capitalize(formData.name.trim()),
    };
    try {
      if (editingId) {
        // to edit
        const response = await skillService.update(editingId, payload);
        if (response.data.success) {
          notify.success("Skill updated successfully");
        }
      } else {
        // to create
        const response = await skillService.create(payload);
        if (response.data.success) {
          notify.success("Skill added successfully");
        }
      }

      await fetchSkills();
      resetForm();
    } catch (error: any) {
      notify.error( error.response?.data?.error || 'Skill adding Failed, try again later' ) 
    }
  }
  const [confirmModal, setConfirmModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleConfirm = () => {
      if (!deleteId) return;
      setConfirmModal(false);
      handleDelete(deleteId);
    };
  // to delete skill
  const handleDelete = async (id: string) => {
    try {
      const response = await skillService.delete(id);
      if (response.data.success) {
        notify.success("Skill deleted successfully");
        await fetchSkills(); 
      }
    } catch (error: any) {
      notify.error(error.response?.data?.error || "Failed to delete skill");
    }
  };

  // to edit skill ========= 
  const handleEdit = (row: Skill) => {
    setEditingId(row.id);
    setFormData({
      name: row.name,
      category: row.category,
      status: row.status,
    });
    setModalOpen(true); 
  };

  // ====== Add skill modal - end =============================
  const [skills, setSkills] = useState<Skill[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  
  const [page, setPage] = useState(1);
  const [limit] = useState(10); 
  const [totalPages, setTotalPages] = useState(1);
  
  // ==== to fetch available skill to include in the table - start ==== 
  const fetchSkills = async () => {
    try {
      const response = await skillService.getAll(search, page, limit);
      const { skills } = response.data;
      setSkills(skills.data);
      setTotalPages(skills.totalPages)
    } catch (error: any) {
        notify.error(error.response?.data?.error || "Failed to fetch skills");
    }
  };

    useEffect(() => {
      const delay = setTimeout(() => {
        fetchSkills();
      }, 500);
      
      return () => clearTimeout(delay);
    }, [page, search]);
  // ==== to fetch available skill to include in the table - end ==== 

  const filteredSkills = skills
    .filter((skill) => {
      if (activeTab === 'All') return true;
      return skill.status === activeTab.toLowerCase();
    })

    // ====== Columns for table - start ===================
    const columns: Column<Skill>[] = [
      { key: 'name', header: 'Skill Name' },
      { key: 'category', header: 'Category' },
      {
        key: 'status',
        header: 'Status',
        render: (value: string) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              value === 'Active'
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
        render: (_, row) => (
          <div className=" gap-2">
            <Button label='Edit' onClick={() => handleEdit(row)}
            className="mx-1 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-transparent border border-indigo-600 dark:border-indigo-400 rounded hover:bg-indigo-50 dark:bg-transparent dark:hover:bg-indigo-900"/>
            <Button label='Delete' onClick={() => {
              setDeleteId(row.id);
              setConfirmModal(true);
            }}
            className="mx-1 px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 border bg-transparent border-red-600 dark:border-red-400 rounded hover:bg-red-50 dark:bg-transparent dark:hover:bg-red-900"/>
          </div>
        ),
      },
    ];
    // ====== Columns for table - end ===================
  return (
    <>
    {/* delete skill confirmation modal - start */}
    <ConfirmationModal
      isOpen={confirmModal}
      title="Confirm Delete"
      description="Are you sure you want to delete this skill?"
      onCancel={() => {
        setConfirmModal(false);
        setDeleteId(null);
      }}
      onConfirm={() => handleConfirm()}
    />
    {/* delete skill confirmation modal - start */}

    {/* Add skill modal - start */}
    <AdminModal
      isOpen={isModalOpen}
      onClose={() => resetForm()}
      onSubmit={()=> handleSubmit()}
      formData={formData}
      onChange={handleChange}
      title='Add Skill'
      fields={modalFields}
      dropdowns={modalDropdowns}
      errors={errors}
    />
    {/* Add skill modal - end */}

    <div className="p-4 bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Skill Management
        </h1>
        <Button label='+Add Skill' onClick={() => setModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-600 rounded hover:bg-indigo-700 dark:hover:bg-indigo-700"/>
      </div>

      <SearchFilter search={search} onSearchChange={setSearch} />
      <FilterTabs tabs={skillTabs} activeTab={activeTab} onChange={setActiveTab} />

      <ReusableTable title="Skill Listing" columns={columns} data={filteredSkills} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
    </>
  );
};

export default Skills;