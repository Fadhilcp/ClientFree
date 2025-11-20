import React, { useEffect, useState } from 'react';
import FilterTabs from '../../components/admin/FilterTabs';
import SearchFilter from '../../components/admin/SearchFilter';
import ReusableTable from '../../components/ui/Table';
import { userService } from '../../services/user.service';
import { capitalize, mapStatus, formatDate } from '../../utils/formatters';
import { notify } from '../../utils/toastService';
import Pagination from '../../components/ui/Pagination';
import type { UserListingDto } from '../../types/user/userListing.dto';
import type { UserListing } from '../../types/user/userListing.type';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader/Loader';
import AdminModal from '../../components/ui/Modal/AdminModal';
import UserDetailModal from '../../components/ui/Modal/UserDetailModal';
import type { FreelancerProfileDto } from '../../types/user/freelancerProfile.dto';
import type { ClientProfileDto } from '../../types/user/clientProfile.dto';
import ProfileImage from '../../components/user/profile/ProfileImage';


export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
}


const modalDropdowns: {
  name: 'status'; label?: string; options: string[];
}[] = [
      { name: 'status', label: 'Status', options: ['active', 'inactive', 'banned'] },
    ]

const userTabs: string[] = [
  'All',
  'Active',
  'Inactive',
  'Suspended',
  'Admin',
  'Client',
  'Freelancer',
  'Premium',
];

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserListing[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  
  // const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  
  const [page, setPage] = useState(1);
  const [limit] = useState(10); 
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getProfiles(search ,page, limit);
      const { users } = response.data
      const rawUsers = users.data;

      const mappedUsers: UserListing[] = rawUsers.map((user: UserListingDto) => ({
        ...user,
        id: user._id,
        role: capitalize(user.role),
        status: mapStatus(user.status),
        joined: user.createdAt ? formatDate(user.createdAt) : "—",
        lastLoginAt: user.lastLoginAt ? formatDate(user.lastLoginAt) : "—"
      }));

      setUsers(mappedUsers);
      setTotalPages(users.totalPages);
    } catch (error: any) {
      notify.error(error.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
        fetchUsers();   
      }, 500);
      
      return () => clearTimeout(delay);
    }, [page, search]);
    
    const filteredUsers = users
    .filter((user) => {
        if (activeTab === 'All') return true;
        if (['Active', 'Inactive', 'Suspended'].includes(activeTab)) {
          return user.status === activeTab;
        }
        if (activeTab === 'Premium') {
          return user.subscription !== null;
        }
        return user.role === activeTab;
      })
      // user status handle - start ==================
      const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
      const [selectedStatus, setSelectedStatus] = useState<{ status: string }>({
        status: ''
      })
      const [selectedId, setSelectedId] = useState<string | null>(null);

      const handleSubmit = async() => {
        if(!selectedId) return;

        const currentUser = users.find((user) => user.id === selectedId);
        if(currentUser && currentUser.status.toLowerCase() === selectedStatus.status.toLowerCase()){
          notify.info(`User is already ${selectedStatus.status.toLowerCase()}`);
          return;
        }
        setLoading(true);
        try {
          const response = await userService.changeUserStatus(selectedId,selectedStatus);
          if(response.data.success){
            notify.success('User status updated successfully');
            fetchUsers();
            setIsStatusModalOpen(false);
          }
        } catch (error: any) {
          notify.error(error.response?.data?.error || 'Failed to update user status')
        } finally {
          setLoading(false);
        }
      }

      const handleStatus = async(row: UserListing) => {
        setLoading(true);
        try {
          const response = await userService.getProfileById(row.id)
          const { user } = response.data;
          setSelectedId(user.id)
          setSelectedStatus({ status: user.status });
          setIsStatusModalOpen(true);
        } catch (error: any) {
          console.log("🚀 ~ handleStatus ~ error:", error)
          notify.error( error.response?.data?.error || 'Failed to fetch user status');
        } finally {
          setLoading(false);
        }
      }

      const resetData = () => {
        setSelectedId(null);
        setSelectedStatus({ status: '' });
        setIsStatusModalOpen(false);
      }
      // user status handle - end ==================
      //  user view detail modal - start ==============
      const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
      const [selectedUser, setSelectedUser] = useState<FreelancerProfileDto | ClientProfileDto | null>(null);

      const handleViewDetail = async(row: UserListing) => {
        setLoading(true);
        try {
          const response = await userService.getProfileById(row.id);
          const { user } = response.data;
          setSelectedUser(user);
          setIsDetailModalOpen(true);
        } catch (error: any) {
          notify.error(error.response?.data?.error || 'Failed to fetch user details');
        } finally {
          setLoading(false);
        }
      }
      //  user view detail modal - end ==============
      const columns: Column<UserListing>[] = [
        {
          key: 'profileImage',
          header: 'Avatar',
          render: (value: string) => (
            <ProfileImage src={value} size={40}/>
          ),
        },
        { key: 'username', header: 'Username' },
        { key: 'email', header: 'Email' },
        { key: 'role', header: 'Role' },
        {
          key: 'status',
          header: 'Status',
          render: (value: string) => (
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                value === 'Active'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : value === 'Suspended'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {value}
            </span>
          ),
        },
        { key: 'joined', header: 'Joined' },
        { key: 'lastLoginAt', header: 'Last Login' },
        {
          key: 'id',
          header: 'Actions',
          render: (_, row) => (
            <div className="flex gap-2">
              <Button label='View Detail' onClick={() => handleViewDetail(row)}
              className="mx-1 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-transparent dark:bg-transparent border border-indigo-600 dark:border-indigo-400 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900"/>
              <Button label='Update Status' onClick={() => handleStatus(row)}
              className="mx-1 px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 border bg-transparent dark:bg-transparent border-red-600 dark:border-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900"/>
            </div>
          ),
        },
      ];
  return (
    <div className="p-4 bg-white dark:bg-gray-900 min-h-screen">
      { loading && <Loader/> }

      <AdminModal
        isOpen={isStatusModalOpen}
        onClose={() => resetData()}
        onSubmit={()=> handleSubmit()}
        formData={selectedStatus}
        onChange={(_, value) => setSelectedStatus({ status: value })}
        title='Change Status'
        dropdowns={modalDropdowns}
      />

      <UserDetailModal
      isOpen={isDetailModalOpen}
      onClose={() => setIsDetailModalOpen(false)}
      user={selectedUser}
      />
      <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
        User Management
      </h1>

      <SearchFilter
        search={search}
        onSearchChange={setSearch}
      />

      <FilterTabs tabs={userTabs} activeTab={activeTab} onChange={setActiveTab} />

      <ReusableTable
        title="User Listing"
        columns={columns}
        data={filteredUsers}
        />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default Users;