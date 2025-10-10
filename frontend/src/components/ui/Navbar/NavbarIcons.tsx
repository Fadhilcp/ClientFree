import React from 'react'

const NavbarIcons: React.FC = () => {
  return (
     <>
        <button className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white">
            <i className="fas fa-headset text-lg"></i>
        </button>
        <button className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white">
            <i className="fas fa-bell text-lg"></i>
        </button>
        <button className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white">
            <i className="fas fa-message text-lg"></i>
        </button>
        <button className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white">
            <i className="fas fa-user-circle text-lg"></i>
        </button>
    </>
  )
}

export default NavbarIcons
