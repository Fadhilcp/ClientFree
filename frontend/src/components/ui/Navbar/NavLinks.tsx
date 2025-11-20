import React from 'react'
import { useLocation } from 'react-router-dom';

interface NavLinksProps {
    links: string[];
    navigate: (path: string) => void;
    routes: Record<string, string>;
}

const NavLinks: React.FC<NavLinksProps> = ({ links, navigate, routes }) => {

    const location = useLocation();

   return (
    <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
      {links.map((label, i) => {
        const isActive = location.pathname.startsWith(routes[label]);

        return (
          <li key={i}>
            <button
              onClick={() => navigate(routes[label])}
              className={`block py-2 pl-1 pr-1 ${
                    isActive
                    ? "text-indigo-600 dark:text-indigo-500 border-b-2 border-indigo-600 dark:border-indigo-500"
                    : "text-gray-700 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white"
                }`}
            >
              {label}
              </button>
          </li>
        );
      })}
    </ul>
  );
}

export default NavLinks
