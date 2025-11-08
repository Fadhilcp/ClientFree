import React, { useEffect, useState } from 'react'
import type { PlanTableDTO } from '../../types/admin/plan.dto';
import type { SubscriptionDto } from '../../types/admin/subscription.dto';
import { notify } from '../../utils/toastService';
import ReusableTable from '../../components/ui/Table';
import SearchFilter from '../../components/admin/SearchFilter';
import FilterTabs from '../../components/admin/FilterTabs';
import { planService } from '../../services/plan.service';
import { subscriptionService } from '../../services/subscription.service';
import Pagination from '../../components/ui/Pagination';
import AdminModal from '../../components/ui/Modal/AdminModal';
import Button from '../../components/ui/Button';
import type { FeatureKey } from '../../constants/planFeatures';
import FeatureToggles from '../../components/admin/features/FeatureToggle';
import { formatDate } from '../../utils/formatters';

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
}


interface PlanForm {
  userType: 'client' | 'freelancer';
  planName: string;
  priceMonthly: string;
  priceYearly: string;
  currency: string;
  status: 'active' | 'inactive';
  features: Record<FeatureKey, boolean>;
}

const modalFields: { name: keyof PlanForm; label: string; placeholder: string; type?: string }[] = [
        { name: 'planName', label: 'Plan Name', placeholder: 'Enter Plan name' },
        { name: 'priceMonthly', label: 'Monthly Price', placeholder: 'e.g. 499', type: 'number' },
        { name: 'priceYearly', label: 'Yearly Price', placeholder: 'e.g. 4999', type: 'number' },
      ]

      const modalDropdowns: {
  name: keyof PlanForm; label?: string; options: string[];
}[] = [
      { name: 'userType', label: 'User Type', options: ['freelancer','client'] },
      { name: 'status', label: 'Status', options: ['active', 'inactive'] },
    ]

    const subscriptionColumns: Column<SubscriptionDto>[] = [
  { key: 'subscriptionId', header: 'Subscription ID' },
  { key: 'gateway', header: 'Gateway' },
  {
    key: 'status',
    header: 'Status',
    render: (value) => (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
        value === 'active' ? 'bg-green-100 text-green-700' :
        value === 'pending' ? 'bg-yellow-100 text-yellow-700' :
        value === 'expired' ? 'bg-red-100 text-red-700' :
        'bg-gray-100 text-gray-600'
      }`}>
        {value}
      </span>
    ),
  },
  {
    key: 'startDate',
    header: 'Start',
    render: (value) => value ? new Date(value).toLocaleDateString() : '—',
  },
  {
    key: 'expiryDate',
    header: 'Expires',
    render: (value) => value ? new Date(value).toLocaleDateString() : '—',
  },
  {
    key: 'autoRenew',
    header: 'Auto Renew',
    render: (value) => value ? 'Yes' : 'No',
  },
];
const Subscriptions: React.FC = () => {
  const [mainTab, setMainTab] = useState<'Plans' | 'Subscriptions'>('Plans');
  const [statusTab, setStatusTab] = useState<string>('All');
  const [plans, setPlans] = useState<PlanTableDTO[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionDto[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // for debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); 
    
    return () => clearTimeout(handler);
  }, [search]);
  
  useEffect(() => {
    if (mainTab === 'Plans') fetchPlans();
    else fetchSubscriptions();
  }, [mainTab, page, debouncedSearch, statusTab]);
  
  const fetchPlans = async () => {
    try {
      const response = await planService.getPlans(search, statusTab, page, limit);
      const { plans } = response.data;
      const mappedPlans: PlanTableDTO[] = plans.data.map((plan: PlanTableDTO) => ({
        ...plan,
        createdAt: plan.createdAt ? formatDate(plan.createdAt) : "—",
      }));
      setPlans(mappedPlans);
      setTotalPages(plans.totalPages);
    } catch (error: any) {
      notify.error(error.response?.data?.message || 'Failed to fetch plans');
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await subscriptionService.getAll(search, statusTab, page, limit);
      const { subscriptions } = response.data;
      setSubscriptions(subscriptions.data);
      setTotalPages(subscriptions.totalPages);
    } catch (error: any) {
      notify.error(error.response?.data?.message || 'Failed to fetch subscriptions');
    }
  };
  
  const handleMainTab = (tab: 'Plans' | 'Subscriptions') => {
    setMainTab(tab);
    setPage(1);
  }
// == Create Plan modal - start ====================
const [isModalOpen, setModalOpen] = useState<boolean>(false);
const [editingId, setEditingId] = useState<string | null>(null);
const [formData, setFormData] = useState<PlanForm>({
    userType: 'client',
    planName: '',
    priceMonthly: '',
    priceYearly: '',
    currency: 'INR',
    status: 'active',
    features: {
      VerifiedBadge: false,
      PremiumSupport: false,
      BestMatch: false,
      HigherJobVisibility: false,
      UnlimitedInvites: false,
      DirectMessaging: false,
      AIProposalShortlisting: false,
      HigherProfileVisibility: false,
      UnlimitedProposals: false,
      PriorityNotifications: false,
    },
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validateAll = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.planName.trim()) newErrors.planName = 'Plan name is required.';
    if (!formData.priceMonthly || isNaN(Number(formData.priceMonthly))) newErrors.priceMonthly = 'Monthly price must be a number.';
    if (!formData.priceYearly || isNaN(Number(formData.priceYearly))) newErrors.priceYearly = 'Yearly price must be a number.';
    if (!['active', 'inactive'].includes(formData.status)) newErrors.status = 'Invalid status.';
    if (!['client', 'freelancer'].includes(formData.userType)) newErrors.userType = 'Invalid user type.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      userType: 'client',
      planName: '',
      priceMonthly: '',
      priceYearly: '',
      currency: 'INR',
      status: 'active',
      features: {
        VerifiedBadge: false,
        PremiumSupport: false,
        BestMatch: false,
        HigherJobVisibility: false,
        UnlimitedInvites: false,
        DirectMessaging: false,
        AIProposalShortlisting: false,
        HigherProfileVisibility: false,
        UnlimitedProposals: false,
        PriorityNotifications: false,
      },
    });
    setErrors({});
    setModalOpen(false);
  };
  
  const handleChange = (field: string, value: string) => {
    if (field in formData.features) return;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // to fetch exisiting plan for edit
  const handleEdit = async (row: PlanTableDTO) => {
    const response = await planService.getPlan(row.id)
    console.log("🚀 ~ handleEdit ~ response:", response)
    const { plan } = response.data
    setFormData({
      ...plan,
      priceMonthly: plan.price.monthly,
      priceYearly: plan.price.yearly,
      status: plan.active ? 'active' : 'inactive',
    })
    setEditingId(row.id);
    setModalOpen(true); 
  };

 const handleSubmit = async () => {
   const { status, ...data } = formData;
   if (!validateAll()) return;

   
    const payload = {
      ...data,
      priceMonthly: Number(formData.priceMonthly),
      priceYearly: Number(formData.priceYearly),
      active: status === 'active'
    };

    try {
      if (editingId) {
        // to edit
        const response = await planService.updatePlan(editingId, payload);
        if (response.data.success) {
          notify.success("Plan updated successfully");
        }
      } else {
        // to create
        const response = await planService.createPlan(payload);
        if (response.data.success) {
          notify.success("Plan added successfully");
        }
      }
      await fetchPlans();
      resetForm();
    } catch (error: any) {
      notify.error(error.response?.data?.message || 'Failed to create plan');
    }
  };

  
  const stringFormData: Record<string, string> = {
    userType: formData.userType,
    planName: formData.planName,
    priceMonthly: formData.priceMonthly,
    priceYearly: formData.priceYearly,
    currency: formData.currency,
    status: formData.status,
  };
  // == Create Plan modal - end ====================
  // === plan table columns - start ====================
  const planColumns: Column<PlanTableDTO>[] = [
    { key: 'planName', header: 'Plan Name' },
    { key: 'userType', header: 'User Type' },
    { key: 'createdAt', header: 'Created' },
    {
      key: 'price',
      header: 'Price',
      render: (value) => `₹${value.monthly}/mo • ₹${value.yearly}/yr`,
    },
    {
      key: 'active',
      header: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, row) => (
        <div className=" gap-2">
          <Button label='Edit' onClick={() => handleEdit(row)}
          className="mx-1 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-transparent border border-indigo-600 dark:border-indigo-400 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900"/>
        </div>
      ),
    },
  ];
  // === plan table columns - start ====================
  return (
  <div className="p-4 bg-white dark:bg-gray-900 min-h-screen">
    {/* create plan modal - start */}
    <AdminModal
      isOpen={isModalOpen}
      onClose={resetForm}
      onSubmit={handleSubmit}
      formData={stringFormData}
      onChange={handleChange}
      title="Create Plan"
      fields={modalFields}
      dropdowns={modalDropdowns}
      errors={errors}
    >
    <div className="mt-4">
      <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">Features</h3>
      {/* component to list features in modal */}
      <FeatureToggles
        features={formData.features}
        userType={formData.userType}
        onChange={(key, value) =>
          setFormData((prev) => ({
            ...prev,
            features: { ...prev.features, [key]: value },
          }))
        }
      />
    </div>
  </AdminModal>
  {/* create plan modal - end */}


    <div className="flex justify-between items-center mb-4">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
        Subscription Management
      </h1>
        <Button label='+Add Plan' onClick={() => setModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-600 rounded hover:bg-indigo-700 dark:hover:bg-indigo-700"/>
    </div>

    <FilterTabs tabs={['Plans', 'Subscriptions']} activeTab={mainTab} onChange={handleMainTab} />
    <FilterTabs
      tabs={mainTab === 'Plans' ? ['All', 'Active', 'Inactive'] : ['All','Pending', 'Active', 'Expired', 'Cancelled']}
      activeTab={statusTab}
      onChange={setStatusTab}
    />
    <SearchFilter search={search} onSearchChange={setSearch} />

    {mainTab === 'Plans' ? (
  <>
    <ReusableTable<PlanTableDTO> title="Plan Listing" columns={planColumns} data={plans} />
    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </>
    ) : (
    <>
        <ReusableTable<SubscriptionDto> title="Subscription Listing" columns={subscriptionColumns} data={subscriptions} />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </>
    )}

  </div>
);
}

export default Subscriptions;