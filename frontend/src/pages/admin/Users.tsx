import React, { useEffect, useState } from 'react';
import FilterTabs from '../../components/admin/FilterTabs';
import SearchFilter from '../../components/admin/SearchFilter';
import ReusableTable from '../../components/ui/Table';
import { profileService } from '../../services/profile.service';
import { capitalize, mapStatus, formatDate } from '../../utils/formatters';
import { notify } from '../../utils/toastService';
import Pagination from '../../components/ui/Pagination';
import type { UserListingDto } from '../../types/user/userListing.dto';
import type { UserListing } from '../../types/user/userListing.type';
import Button from '../../components/ui/Button';


export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
}

const columns: Column<UserListing>[] = [
  {
    key: 'profileImage',
    header: 'Avatar',
    render: (value: string) => (
      <img
        src={value || '/images/avatar/default.png'}
        alt="Avatar"
        className="w-9 h-9 rounded-full object-cover border border-gray-300 dark:border-gray-600"
      />
    ),
  },
  { key: 'username', header: 'Username' },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role' },
  {
    key: 'status',
    header: 'Status',
    render: (value: any) => (
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
    render: () => (
      <div className="flex gap-2">
        <Button label='View Detail'
        className="mx-1 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-transparent border border-indigo-600 dark:border-indigo-400 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900"/>
        <Button label='Ban User'
        className="mx-1 px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 border bg-transparent border-red-600 dark:border-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900"/>
      </div>
    ),
  },
];

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

  const [page, setPage] = useState(1);
  const [limit] = useState(10); 
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await profileService.getProfiles(search ,page, limit);
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
      }
    };

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

  return (
    <div className="p-4 bg-white dark:bg-gray-900 min-h-screen">
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