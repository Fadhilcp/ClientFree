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

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
}

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
    key: '_id',
    header: 'Actions',
    render: () => (
      <div className=" gap-2">
        <button className="mx-1 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900">
          Edit
        </button>
        <button className="mx-1 px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900">
          Delete
        </button>
      </div>
    ),
  },
];
// ====== Columns for table - end ===================

const skillTabs: string[] = ['All', 'Active', 'Inactive'];

// ===== Add skill modal dropdowns & fields - start =================

const modalFields: { name: keyof SkillForm; label: string; placeholder: string; }[] = [
        { name: 'name', label: 'Skill Name', placeholder: 'Enter skill name' },
      ]

const modalDropdowns: {
  name: keyof SkillForm; label?: string; options: string[];
}[] = [
      { name: 'category', label: 'Category', options: ['Frontend', 'Backend', 'DevOps', 'Design'] },
      { name: 'status', label: 'Status', options: ['acitve', 'inactive'] },
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

  // create skill submiting
  const handleSubmit = async() => {
    if(!validateAll()) return;

    const payload = {
      ...formData,
      name: capitalize(formData.name.trim()),
    };
    try {
      const response = await skillService.create(payload)

      if(response.data.success){
        notify.success('Skill added successfully')
        await fetchSkills();
        resetForm(); 
      }
    } catch (error: any) {
      notify.error( error.response?.data?.error || 'Skill adding Failed, try again later' ) 
    }
  }
  // ====== Add skill modal - end =============================
  const [skills, setSkills] = useState<Skill[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [limit] = useState(10); // You can make this dynamic if needed
  const [totalPages, setTotalPages] = useState(1);

  // ==== to fetch available skill to include in the table - start ==== 
    const fetchSkills = async () => {
      try {
        const response = await skillService.getAll(page, limit);
        console.log("🚀 ~ fetchSkills ~ response:", response)
        const { skills } = response.data;
        setSkills(skills.data);
        setTotalPages(skills.totalPages)
      } catch (error: any) {
        notify.error(error.response?.data?.error || "Failed to fetch skills");
      }
    };

    useEffect(() => {
      fetchSkills();
    }, [page]);
  // ==== to fetch available skill to include in the table - end ==== 

  const filteredSkills = skills
    .filter((skill) => {
      if (activeTab === 'All') return true;
      return skill.status === activeTab.toLowerCase();
    })
    .filter((skill) =>
      [skill.name, skill.category].some((field) =>
        field.toLowerCase().includes(search.toLowerCase())
      )
    );

  return (
    <>
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