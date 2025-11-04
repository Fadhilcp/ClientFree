import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import ProfileImage from '../../user/profile/ProfileImage';
import type { RootState } from '../../../store/store';
import { logout } from '../../../features/authSlice';
import { notify } from '../../../utils/toastService';

const NavbarIcons: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.auth.user);
  const username = user?.username ?? "";
  const email = user?.email ?? "";

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
      dispatch(logout());
      localStorage.removeItem('token');
      notify.success('You’ve been logged out successfully.');
      navigate('/login');
    };


  return (
    <div className="relative flex items-center gap-4">
      <button className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white">
        <i className="fas fa-headset text-lg"></i>
      </button>
      <button className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white">
        <i className="fas fa-bell text-lg"></i>
      </button>
      <button className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white">
        <i className="fas fa-message text-lg"></i>
      </button>

      {/* User Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white"
        >
          <i className="fas fa-user-circle text-lg"></i>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50">
            <div
              className="px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
              onClick={() => {
                navigate('/profile');
                setIsOpen(false);
              }}
            >
              <ProfileImage size={40} />
              <div className="flex flex-col">
                <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">{username}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{email}</div>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700"></div>
            <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
              Settings
            </div>
            <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            onClick={handleLogout} >
              Log Out
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavbarIcons;