import React, { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LogOut,
  X,
  ChevronLeft,
} from "lucide-react";
import { SidebarContext } from './DashboardLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { useButtonSound } from '../../hooks/useButtonSound';
import CheckInFlow from '../../pages/loginPage/CheckInPopup';

const Sidebar = ({ navigationItems }) => {
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const { isOpen, toggleSidebar, isMobileMenuOpen, toggleMobileMenu, windowWidth } =
    useContext(SidebarContext);
  const { themeColors } = useTheme();
  const { playButtonSound } = useButtonSound();
  const navigate = useNavigate();

  // Handle navigation with check-in logic
  const handleNavigation = async (item) => {
    playButtonSound();
    
    // Check if this is the sales route and user hasn't checked in
    if (item.path === '/dashboard/sales') {
      try {
        // Get the last register entry from database
        // Using getAllRegisters as workaround since getLastRegister might not be registered yet
        const allRegistersResult = await window.myAPI?.getAllRegisters();
        const lastRegisterResult = allRegistersResult && allRegistersResult.success && allRegistersResult.data && allRegistersResult.data.length > 0 
          ? { success: true, data: allRegistersResult.data[0] } // First item is the last register
          : { success: true, data: null };
        
        console.log('Sidebar - allRegistersResult:', allRegistersResult);
        console.log('Sidebar - lastRegisterResult:', lastRegisterResult);
        
        if (lastRegisterResult && lastRegisterResult.success && lastRegisterResult.data) {
          const lastRegister = lastRegisterResult.data;
          console.log('Sidebar - lastRegister:', lastRegister);
          console.log('Sidebar - isclosed value:', lastRegister.isclosed, 'type:', typeof lastRegister.isclosed);
          
          // Check if the last register is closed (isclosed = 1)
          // If isclosed = 1 (closed), show popup to open new register
          // If isclosed = 0 (open), no popup needed, go directly to sales
          if (lastRegister.isclosed === 1) {
            console.log('Sidebar - Register is closed, showing check-in popup');
            setShowCheckIn(true);
            return; // Don't navigate yet, wait for check-in completion
          } else {
            console.log('Sidebar - Register is open, going directly to sales');
          }
        } else {
          console.log('Sidebar - No register found, showing check-in popup');
          // If no register found, show check-in popup
          setShowCheckIn(true);
          return;
        }
      } catch (error) {
        console.error('Error checking register status:', error);
        // On error, show check-in popup to be safe
        setShowCheckIn(true);
        return;
      }
    }
    
    // Normal navigation for other routes or if register is closed
    navigate(item.path);
    
    // Close mobile menu if on mobile
    if (windowWidth < 1024) {
      toggleMobileMenu();
    }
  };

  // Handle logout with proper functionality
  const handleLogout = async () => {
    setLogoutLoading(true);
    
    try {
      const currentEmployee = localStorage.getItem('currentEmployee');
      if (currentEmployee) {
        const employeeData = JSON.parse(currentEmployee);
        if (employeeData.id) {
          // Use the global logout function if available, otherwise call directly
          if (window.handleEmployeeLogout) {
            await window.handleEmployeeLogout(employeeData.id);
          } else {
            await window.myAPI?.updateEmployeeLogout(employeeData.id);
          }
        }
      }
      // Clear local storage
      localStorage.removeItem('currentEmployee');
      sessionStorage.clear();
      
      // Wait for 1 second to show progress
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to login
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still navigate to login even if logout fails
      localStorage.removeItem('currentEmployee');
      sessionStorage.clear();
      
      // Wait for 1 second to show progress
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/login');
    } finally {
      setLogoutLoading(false);
    }
  };

  if (logoutLoading) {
    return (
      <div className="fixed inset-0 z-50 flex justify-center items-center">
        {/* Blurred background overlay */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        
        {/* Progress bar container */}
        <div className="relative bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20 text-center min-w-[320px]">
          {/* Animated progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full animate-pulse"></div>
          </div>
          
          {/* Spinner and text */}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-semibold text-gray-800 mb-2">Logging out...</p>
            <p className="text-sm text-gray-600">Please wait while we secure your session</p>
          </div>
          
          {/* Progress dots animation */}
          <div className="flex justify-center mt-4 space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
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
              onClick={(e) => {
                e.preventDefault(); // Prevent default navigation
                handleNavigation(item);
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
          onClick={() => {
            playButtonSound();
            handleLogout();
          }}
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
      {/* Check-In Popup */}
      {showCheckIn && (
        <CheckInFlow 
          onComplete={(shouldNavigate = false) => {
            setShowCheckIn(false);
            // Only navigate to sales if explicitly requested (e.g., after successful register creation)
            if (shouldNavigate) {
              navigate('/dashboard/sales');
            }
            // Close mobile menu if on mobile
            if (windowWidth < 1024) {
              toggleMobileMenu();
            }
          }} 
        />
      )}

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
        } shadow-xl`}
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
        className={`hidden lg:block h-full overflow-hidden flex-shrink-0`}
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