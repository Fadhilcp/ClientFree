import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import { logout } from '../../../features/authSlice';
import { notify } from '../../../utils/toastService';
import { tokenStore } from '../../../utils/tokenStore';
import { authService } from '../../../services/auth.service';
import UserInfo from '../../user/UserInfo';
import NotificationDropdown from '../../user/Notification/NotifcationDropdown';
import { useNotifications } from '../../../context/NotificationContext';

const NavbarIcons: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const { unreadCount } = useNotifications();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, subscription }= useSelector((state: RootState) => state.auth);

  const username = user?.username ?? "";
  const email = user?.email ?? "";
  
  const isVerified = Boolean(subscription?.features?.VerifiedBadge);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async() => {
      await authService.logout();
      dispatch(logout());
      tokenStore.clear();
      notify.success('You’ve been logged out successfully.');
      navigate('/login');
    };

  return (
    <div className="relative flex items-center gap-4">
      {/* Support */}
      <button className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white">
        <i className="fas fa-headset text-lg"></i>
      </button>
      {/* Notification */}
      <button 
      onClick={() => setIsNotificationOpen(!isNotificationOpen)}
      className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white">
        <i className="fas fa-bell text-lg"></i>
          {unreadCount > 0 && (
            <span
              className="z-1
                absolute -top-1
                min-w-[10px] h-[10px]
                p-1 py-2
                bg-red-500 text-white
                text-[10px] font-semibold
                rounded-full
                flex items-center justify-center
              "
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
      </button>
      <NotificationDropdown
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      {/* Message */}
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
              <UserInfo username={username} email={email} useAuthFallback isVerified={isVerified} />
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700"></div>
            <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            onClick={() => {
              navigate('/settings');
              setIsOpen(false);
            }}
                >
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