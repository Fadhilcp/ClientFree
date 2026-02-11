import React, { type JSX } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faBrain,
  faCreditCard,
  faPuzzlePiece,
  faMoneyBillWave,
  faBalanceScale,
  faWallet,
  faArrowDown,
  faBell,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';


interface SidebarItem {
  label: string;
  path: string;
  icon: JSX.Element;
}

const sidebarItems: SidebarItem[] = [
  {
    label: 'Users',
    path: '/admin/users',
    icon: <FontAwesomeIcon icon={faUsers} className="size-4" />,
  },
  {
    label: 'Skills',
    path: '/admin/skills',
    icon: <FontAwesomeIcon icon={faBrain} className="size-4" />,
  },
  {
    label: 'Subscriptions',
    path: '/admin/subscriptions',
    icon: <FontAwesomeIcon icon={faCreditCard} className="size-4" />,
  },
  {
    label: 'AddOns',
    path: '/admin/addOns',
    icon: <FontAwesomeIcon icon={faPuzzlePiece} className="size-4" />,
  },
  {
    label: 'Payouts',
    path: '/admin/payouts',
    icon: <FontAwesomeIcon icon={faMoneyBillWave} className="size-4" />,
  },
  {
    label: 'Disputes',
    path: '/admin/disputes',
    icon: <FontAwesomeIcon icon={faExclamationTriangle} className="size-4" />,
  },
  {
    label: 'Payments',
    path: '/admin/payments',
    icon: <FontAwesomeIcon icon={faCreditCard} className="size-4" />,
  },
  {
    label: 'Escrow',
    path: '/admin/escrow-milestones',
    icon: <FontAwesomeIcon icon={faBalanceScale} className="size-4" />,
  },
  {
    label: 'Wallets',
    path: '/admin/wallets',
    icon: <FontAwesomeIcon icon={faWallet} className="size-4" />,
  },
  {
    label: 'Withdrawals',
    path: '/admin/withdrawals',
    icon: <FontAwesomeIcon icon={faArrowDown} className="size-4" />,
  },
  {
    label: 'Notifications',
    path: '/admin/notifications',
    icon: <FontAwesomeIcon icon={faBell} className="size-4" />,
  },
]; 

const AdminSidebar: React.FC = () => {
  return (
    <div
      id="sidebar"
      className="lg:block lg:translate-x-0 w-50 -translate-x-full transition-all duration-300 transform h-full hidden fixed top-0 left-0 bottom-0 z-60 bg-white border-e border-gray-200 dark:bg-gray-900 dark:border-gray-700"
      role="dialog"
      tabIndex={-1}
      aria-label="Sidebar"
    >
      <div className="relative flex flex-col h-full max-h-full">
        {/* Header */}
        <header className="p-4 flex justify-between items-center gap-x-2">
          <span className="flex-none font-semibold text-xl text-gray-800 dark:text-gray-100">
            ClientFree
          </span>
        </header>

        {/* Body */}
        <nav className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-gray-100 scrollbar-thumb-gray-300 dark:scrollbar-track-gray-800 dark:scrollbar-thumb-gray-600">
          <div className="pb-0 px-2 w-full flex flex-col flex-wrap">
            <ul className="space-y-1">
              {sidebarItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-gray-800 rounded-lg hover:bg-gray-200 focus:outline-none focus:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:bg-gray-700 dark:text-gray-100"
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;