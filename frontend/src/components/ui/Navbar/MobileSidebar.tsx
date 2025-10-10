import React from 'react'

interface MobileSidebarProps {
    isOpen: boolean;
    links: string[];
    onClose: () => void;
    navigate: (path: string) => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, links, onClose, navigate }) => {
  return (
     <>
        {/* Overlay */}
        {isOpen && (
            <div
                className="fixed inset-0 z-40 lg:hidden backdrop-blur-sm bg-black/20"
                onClick={onClose}
            />
        )}

        {/* Sidebar drawer */}
        <div
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg z-50 transform transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:hidden`}
        >
        <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">Menu</span>
            <button
                onClick={onClose}
                className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white"
            >
                <i className="fas fa-times text-xl"></i>
            </button>
        </div>
            <ul className="flex flex-col p-4 space-y-4">
                {links.map((label, i) => (
                    <li key={i}>
                        <button
                            onClick={() => {
                                navigate(`/${label.toLowerCase().replace(/\s+/g, '-')}`);
                                onClose();
                            }}
                            className="w-full text-left text-gray-700 dark:text-gray-300 font-medium hover:text-indigo-600 dark:hover:text-white"
                        >
                            {label}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    </>
  )
}

export default MobileSidebar;
