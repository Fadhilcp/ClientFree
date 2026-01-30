const SidebarHeader = () => {
  return (
    <div className="py-2 px-3 flex flex-row justify-between items-center border-b border-gray-200 dark:border-gray-700">
      {/* Avatar */}
      <img
        className="w-10 h-10 rounded-full"
        src="http://andressantibanez.com/res/avatar.png"
        alt="avatar"
      />

      {/* Action icons */}
      <div className="flex items-center">
        <button className="ml-0 text-indigo-600 dark:text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-400 transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24">
            <path d="M12 20.664a9.163 9.163 0 0 1-6.521-2.702..." />
          </svg>
        </button>
        <button className="ml-4 text-indigo-600 dark:text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-400 transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24">
            <path d="M19.005 3.175H4.674..." />
          </svg>
        </button>
        <button className="ml-4 text-indigo-600 dark:text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-400 transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24">
            <path d="M12 7a2 2..." />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SidebarHeader;