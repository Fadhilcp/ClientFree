import React, { useEffect, useState } from 'react'
import type { PlanDTO } from '../../types/admin/plan.dto';
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
import {type FeatureKey, commonFeatures, clientFeatures, freelancerFeatures } from '../../constants/planFeatures';

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
}

const planColumns: Column<PlanDTO>[] = [
  { key: 'planName', header: 'Plan Name' },
  { key: 'userType', header: 'User Type' },
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
];

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
      { name: 'status', label: 'Status', options: ['acitve', 'inactive'] },
    ]

interface Props {
  features: Record<FeatureKey, boolean>;
  userType: 'client' | 'freelancer';
  onChange: (key: FeatureKey, value: boolean) => void;
}

const FeatureToggles: React.FC<Props> = ({ features, userType, onChange }) => {
  const visibleFeatures: FeatureKey[] = [
    ...commonFeatures,
    ...(userType === 'client' ? clientFeatures : freelancerFeatures),
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {visibleFeatures.map((key) => (
        <label key={key} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={features[key]}
            onChange={(e) => onChange(key, e.target.checked)}
            className="form-checkbox"
          />
          <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
        </label>
      ))}
    </div>
  );
};

    
    

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
const Subscriptions = () => {
  const [mainTab, setMainTab] = useState<'Plans' | 'Subscriptions'>('Plans');
  const [statusTab, setStatusTab] = useState<string>('Active');
  const [plans, setPlans] = useState<PlanDTO[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionDto[]>([]);
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [limit] = useState(10); // You can make this dynamic if needed
  const [totalPages, setTotalPages] = useState(1);

  
  useEffect(() => {
    if (mainTab === 'Plans') fetchPlans();
    else fetchSubscriptions();
  }, [mainTab, page]);
  
  const fetchPlans = async () => {
    try {
      const response = await planService.getPlans(page, limit);
      const { plans } = response.data;
      setPlans(plans.data);
      setTotalPages(plans.totalPages);
    } catch (err) {
      notify.error('Failed to fetch plans');
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await subscriptionService.getAll(page, limit);
      const { subscriptions } = response.data;
      setSubscriptions(subscriptions.data);
      setTotalPages(subscriptions.totalPages);
    } catch (err) {
      notify.error('Failed to fetch subscriptions');
    }
  };
  
  const handleMainTab = (tab: 'Plans' | 'Subscriptions') => {
    setMainTab(tab);
    setPage(1);
  }
  
  const filteredPlans = plans.filter(p =>
    (statusTab === 'All' || (statusTab === 'Active') === p.active) &&
    p.planName.toLowerCase().includes(search.toLowerCase())
  );
  
  const filteredSubscriptions = subscriptions.filter(s =>
    (statusTab === 'All' || s.status === statusTab.toLowerCase()) &&
    s.gateway.toLowerCase().includes(search.toLowerCase())
  );
  // ===============================
  // ================================
  // ====================================
  const [isModalOpen, setModalOpen] = useState<boolean>(false);

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
    if (!formData.currency.trim()) newErrors.currency = 'Currency is required.';
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

 const handleSubmit = async () => {
    if (!validateAll()) return;

    const payload = {
      ...formData,
      priceMonthly: Number(formData.priceMonthly),
      priceYearly: Number(formData.priceYearly),
    };

    try {
      await planService.createPlan(payload as any);
      notify.success('Plan created successfully');
      resetForm();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
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

// ===========================
// ==============================


  return (
  <div className="p-4 bg-white dark:bg-gray-900 min-h-screen">
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
    <ReusableTable<PlanDTO> title="Plan Listing" columns={planColumns} data={filteredPlans} />
    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </>
    ) : (
    <>
        <ReusableTable<SubscriptionDto> title="Subscription Listing" columns={subscriptionColumns} data={filteredSubscriptions} />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </>
    )}

  </div>
);
}

export default Subscriptions