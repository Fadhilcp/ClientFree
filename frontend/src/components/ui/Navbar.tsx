import React from "react";
import Button from "./Button";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  role: "landing" | "freelancer" | "client";
}

const Navbar: React.FC<NavbarProps> = ({ role }) => {

  const navigate = useNavigate();


  const navItems = {
    landing: ["Home", "About"],
    freelancer: ["Home", "My Jobs", "My Proposals", "Find Jobs", "Payments", "Premium"],
    client: ["Home", "My Jobs", "Freelancers", "Payments", "Premium"],
  };

  const links = navItems[role] || [];

  return (
    <header className="fixed w-full z-50">
      <nav className="bg-white border-gray-200 py-2.5 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between max-w-screen-xl px-4 mx-auto">
          {/* Logo */}
          <a href="#" className="flex items-center">
            <span className="self-center text-2xl font-extrabold whitespace-nowrap text-indigo-600 dark:text-indigo-700">
              ClientFree
            </span>
          </a>

          {/* Right-side buttons */}
          <div className="flex items-center lg:order-2 space-x-2">
            {role === "landing" ? (
              <>
                <Button
                  label="Login"
                  variant="secondary"
                  onClick={() => navigate("/login")}
                />
                <Button
                  label="Sign Up"
                  variant="primary"
                  onClick={() => navigate("/roleselect")}
                />
              </>
            ) : (
              <></>
            )}


            {/* Mobile menu toggle */}
            <button
              data-collapse-toggle="mobile-menu-2"
              type="button"
              className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              aria-controls="mobile-menu-2"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Navigation links */}
          <div
            className="items-center justify-between hidden w-full lg:flex lg:w-auto lg:order-1"
            id="mobile-menu-2"
          >
            <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
              {links.map((label, i) => (
                  <li key={i}>
                    <button
                      onClick={() => navigate(`/${label.toLowerCase().replace(/\s+/g, '-')}`)}
                      className={`block py-2 pl-3 pr-4 font-bold ${
                        i === 0
                          ? "text-white bg-indigo-600 rounded lg:bg-transparent lg:text-indigo-600"
                          : "text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-indigo-600"
                      } lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700`}
                      aria-current={i === 0 ? "page" : undefined}
                    >
                      {label}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;