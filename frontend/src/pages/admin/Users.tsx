import React, { useEffect, useState } from 'react';
import FilterTabs from '../../components/admin/FilterTabs';
import SearchFilter from '../../components/admin/SearchFilter';
import ReusableTable from '../../components/ui/Table';
import { profileService } from '../../services/profile.service';
import { capitalize, mapStatus, formatDate } from '../../utils/formatters';
import { notify } from '../../utils/toastService';
import Pagination from '../../components/ui/Pagination';

type User = {
  id: string;
  profileImage?: string;
  username: string;
  name?: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  joined: string;
  lastLoginAt: string;
  isPremium: boolean;
};

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
}

const columns: Column<User>[] = [
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
        <button className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded hover:bg-blue-50 dark:hover:bg-blue-900">
          View Detail
        </button>
        <button className="px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900">
          Ban User
        </button>
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

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);
  const [limit] = useState(4); // You can make this dynamic if needed
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await profileService.getProfiles(page, limit);
        const { users } = response.data
        const rawUsers = users.data;

        const mappedUsers: User[] = rawUsers.map((user: any) => ({
          id: user._id,
          profileImage: user.profileImage,
          username: user.username,
          name: user.name || '',
          email: user.email,
          role: capitalize(user.role),
          status: mapStatus(user.status),
          joined: formatDate(user.createdAt),
          lastLoginAt: formatDate(user.lastLoginAt),
          isPremium: user.isPremium,
        }));

        setUsers(mappedUsers);
        setTotalPages(users.totalPages);
      } catch (error: any) {
        notify.error(error.response?.data?.error || 'Failed to fetch users');
      }
    };

    fetchUsers();
  }, [page]);

      const filteredUsers = users
      .filter((user) => {
        if (activeTab === 'All') return true;
        if (['Active', 'Inactive', 'Suspended'].includes(activeTab)) {
          return user.status === activeTab;
        }
        if (activeTab === 'Premium') {
          return user.isPremium === true;
        }
        return user.role === activeTab;
      })
      .filter((user) =>
        [user.name, user.email, user.role, user.username].some((field) =>
          field?.toLowerCase().includes(search.toLowerCase())
        )
      );

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