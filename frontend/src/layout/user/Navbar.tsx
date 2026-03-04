import React, { useState } from "react";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/ui/Navbar/Logo";
import NavbarIcons from "../../components/ui/Navbar/NavbarIcons";
import NavLinks from "../../components/ui/Navbar/NavLinks";
import MobileSidebar from "../../components/ui/Navbar/MobileSidebar";

interface NavbarProps {
  role: "landing" | "freelancer" | "client";
}

const Navbar: React.FC<NavbarProps> = ({ role }) => {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

    const navRoutes = {
      landing: {
        Home: "/",
        // About: "/about",
      },
      freelancer: {
        Home: "/home",
        "My Jobs": "/my-jobs",
        "My Proposals": "/my-proposals",
        "Find Jobs": "/find-jobs",
        Payments: "/payments",
        Premium: "/premium",
      },
      client: {
        Home: "/home",
        "My Jobs": "/my-jobs",
        Freelancers: "/freelancers",
        Payments: "/payments",
        Premium: "/premium",
      },
    };


  const links = Object.keys(navRoutes[role] || {});

  return ( 
    <>
      <header className="fixed w-full z-50">
        <nav className="bg-white border-gray-200 py-3.5 dark:bg-gray-900">
          <div className="flex flex-wrap items-center justify-between max-w-screen-xl px-4 mx-auto">
              {/* Mobile menu toggle */}
              {role !== "landing" && (
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                >
                  <span className="sr-only">Open sidebar</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}

            {/* Logo */}
            <Logo/>

            {/* Right-side buttons */}
            <div className="flex items-center lg:order-2 space-x-2">
              {role !== "landing" ? (

                <NavbarIcons/>

              ) : (
                <>
                  <Button
                    label="Login"
                    variant="secondary"
                    onClick={() => navigate("/login")}
                    className="px-4 py-1 text-sm rounded font-semibold transition-colors duration-200"
                  />
                  <Button
                    label="Sign Up"
                    variant="primary"
                    onClick={() => navigate("/roleselect")}
                    className="px-4 py-1 text-sm rounded font-semibold transition-colors duration-200"
                  />
                </>
              )}
            </div>

            {/* Navigation links for desktop */}
            <div
              className="items-center justify-between hidden w-full lg:flex lg:w-auto lg:order-1"
              id="mobile-menu-2"
            >

              <NavLinks links={links} navigate={navigate}
              routes={navRoutes[role]}/>

            </div>
          </div>
        </nav>
      </header>

      {/* Sidebar for mobile */}
      {role !== "landing" && (

        <MobileSidebar
          isOpen={isSidebarOpen}
          links={links}
          onClose={() => setSidebarOpen(false)}
          navigate={navigate}
        />

      )}
    </>
  );
};

export default Navbar;