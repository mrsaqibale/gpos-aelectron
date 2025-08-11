import React, { useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import {
  LogOut,
  X,
  ChevronLeft,
} from "lucide-react";
import { SidebarContext } from './DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';

const Sidebar = ({ navigationItems }) => {
  const [logoutLoading, setLogoutLoading] = useState(false);
  const { isOpen, toggleSidebar, isMobileMenuOpen, toggleMobileMenu, windowWidth } =
    useContext(SidebarContext);
  const { themeColors } = useTheme();

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
                `flex items-center px-4 py-3 text-sm text-gray-100 ${
                  isActive ? "border-l-2 border-white" : ""
                }`
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.055)' : 'transparent',
                ':hover': { backgroundColor: 'rgba(255, 255, 255, 0.055)' }
              })}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.055)';
              }}
              onMouseLeave={(e) => {
                const isActive = e.target.classList.contains('bg-[#ffffff0e]') || e.target.closest('a').classList.contains('bg-[#ffffff0e]');
                e.target.style.backgroundColor = isActive ? 'rgba(255, 255, 255, 0.055)' : 'transparent';
              }}
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
        className={`lg:hidden fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } shadow-xl rounded-r-xl`}
        style={{ backgroundColor: themeColors.primary }}
      >
        <div 
          className="p-4 border-b flex justify-between items-center"
          style={{ borderColor: themeColors.primaryLight }}
        >
          <div className="cursor-pointer">
            <h1 className="font-bold text-white text-xl">
             G
              <span className="text-secondary">POS</span>
              
            </h1>
          </div>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-full text-white"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.23)' }}
          >
            <X size={24} />
          </button>
        </div>
        <NavContent />
      </div>

      {/* Desktop Sidebar */}
      <div 
        className={`hidden lg:block h-full rounded-l-xl rounded-r-xl overflow-hidden flex-shrink-0`}
        style={{
          width: isOpen ? "200px" : "60px",
          transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
          backgroundColor: themeColors.primary,
        }}
      >
        <div className="h-full flex flex-col">
          <div 
            className="p-3 flex items-center justify-between border-b cursor-pointer"
            style={{ borderColor: 'rgba(255, 255, 255, 0.23)' }}
          >
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
              className="p-1 cursor-pointer rounded-full text-white"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.39)' }}
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