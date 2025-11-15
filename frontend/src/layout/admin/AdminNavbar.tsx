import React from 'react';
import ProfileImage from '../../components/user/profile/ProfileImage';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { tokenStore } from '../../utils/tokenStore';
import { notify } from '../../utils/toastService';
import { logout } from '../../features/authSlice';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store/store';
import { authService } from '../../services/auth.service';

const AdminNavbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = async() => {
    await authService.logout();
    dispatch(logout());
    tokenStore.clear();
    notify.success('You’ve been logged out successfully.');
    navigate('/admin/login');
  }
  return (
    <header className="w-full h-16 px-6 flex items-center justify-end border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-2">
        {/* Avatar */}
        <ProfileImage size={40}/>

        {/* Username */}
        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
          Admin Username
        </span>
        <Button label='Logout'
        onClick={handleLogout}
        className='ml-4 px-3 py-1 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600'/>
      </div>
    </header>
  );
};

export default AdminNavbar;