import React, { useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import {
  LogOut,
  X,
  ChevronLeft,
} from "lucide-react";
import { SidebarContext } from './DashboardLayout';

const Sidebar = ({ navigationItems }) => {
  const [logoutLoading, setLogoutLoading] = useState(false);
  const { isOpen, toggleSidebar, isMobileMenuOpen, toggleMobileMenu, windowWidth } =
    useContext(SidebarContext);

  // Handle logout (frontend only)
  const handleLogout = async () => {
    setLogoutLoading(true);
    
    // Simulate logout process
    setTimeout(() => {
      setLogoutLoading(false);
      // In a real app, you would redirect to login page
      console.log("User logged out");
    }, 1000);
  };

  if (logoutLoading) {
    return (
      <div className="fixed inset-0 bg-[#0000008d] z-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <div className="w-7 h-7 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-gray-700 font-medium">Logging out...</p>
        </div>
      </div>
    );
  }

  const NavContent = () => (
    <nav className="mt-3 flex flex-col h-full">
      <div className="flex-1">
        {navigationItems.map((item) => (
          <div key={item.name}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm  text-gray-100 hover:bg-[#ffffff0e] ${
                  isActive ? "bg-[#ffffff0e] border-l-2 border-white" : ""
                }`
              }
              onClick={() => {
                if (windowWidth < 1024) {
                  toggleMobileMenu();
                }
              }}
            >
              <span className="text-gray-100">{item.icon}</span>
              <span
                className="ml-2 font-medium whitespace-nowrap"
                style={{
                  opacity: isOpen ? 1 : 0,
                  transition: "opacity 300ms ease",
                }}
              >
                {item.name}
              </span>
            </NavLink>
          </div>
        ))}
      </div>

      {/* Logout Button */}
      <div className="px-4 mb-6 cursor-pointer">
        <button
          onClick={handleLogout}
          className="w-full flex items-center cursor-pointer gap-2 py-3 text-gray-100"
        >
          <LogOut size={20} />
          <span
            className="font-medium"
            style={{
              opacity: isOpen ? 1 : 0,
              transition: "opacity 300ms ease",
            }}
          >
            Logout
          </span>
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-[#0000002a] bg-opacity-50 z-40"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-primaryLight transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } shadow-xl rounded-r-xl`}
      >
        <div className="p-4 border-b border-primary flex justify-between items-center">
          <div className="cursor-pointer">
            <h1 className="font-bold text-white text-xl">
             G
              <span className="text-secondary">POS</span>
              
            </h1>
          </div>
          <button
            onClick={toggleMobileMenu}
            className="p-2 bg-[#ffffff3b] rounded-full text-white"
          >
            <X size={24} />
          </button>
        </div>
        <NavContent />
      </div>

      {/* Desktop Sidebar */}
      <div 
        className={`hidden lg:block h-full bg-primaryLight rounded-l-xl rounded-r-xl overflow-hidden flex-shrink-0`}
        style={{
          width: isOpen ? "200px" : "60px",
          transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="h-full flex flex-col">
          <div className="p-3 flex items-center justify-between border-b border-[#ffffff3b] cursor-pointer">
            <h1
              className="font-bold text-white text-xl transition-opacity duration-300"
              style={{
                opacity: isOpen ? 1 : 0,
                width: isOpen ? "auto" : 0,
              }}
            >
             G
              <span className="text-secondary">POS</span>
           System
            </h1>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSidebar();
              }}
              className="p-1 bg-[#ffffff63] cursor-pointer rounded-full text-white"
            >
              <ChevronLeft
                size={20}
                className={`transform transition-transform duration-300 ${
                  !isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
          <NavContent />
        </div>
      </div>
    </>
  );
};

export default Sidebar;