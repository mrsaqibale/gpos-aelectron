import React, { useState, createContext, useEffect } from 'react';
import Sidebar from './Sidebar';
import ReservationsHeader from './ReservationsHeader';
import OrdersHeader from './OrdersHeader'; // Import the new OrdersHeader component
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import CheckInFlow from '../../pages/loginPage/CheckInPopup';
import {
  LayoutDashboard,
  Search,
  Users2, Utensils, Table,
  Tag, X, LogOut, User, Home, Settings, Clock, BarChart3, Lock
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export const SidebarContext = createContext();

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showDashboardSlider, setShowDashboardSlider] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { themeColors } = useTheme();
  
  // Mock user data for frontend demo
  const user = {
    role: 'admin', 
    name: 'John Doe',
    email: 'john@example.com'
  };
  
  const userRole = user?.role?.toLowerCase();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle logout session tracking when user leaves the app
  useEffect(() => {
    const handleBeforeUnload = async () => {
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
      } catch (error) {
        console.error('Error handling beforeunload logout:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Check if we should show check-in popup
  useEffect(() => {
    const hasCheckedIn = sessionStorage.getItem('hasCheckedIn');
    const triggerCheckIn = sessionStorage.getItem('triggerCheckIn');
    const currentEmployee = localStorage.getItem('currentEmployee');

    // Show check-in popup if landing on dashboard with a login trigger or normal rules
    const onDashboard = location.pathname === '/dashboard';
    const shouldTriggerFromLogin = triggerCheckIn === 'true';
    const shouldShowByRules = userRole !== 'admin' && !hasCheckedIn && currentEmployee;

    if (onDashboard && (shouldTriggerFromLogin || shouldShowByRules)) {
      setShowCheckIn(true);
      sessionStorage.setItem('hasCheckedIn', 'true');
      if (shouldTriggerFromLogin) {
        sessionStorage.removeItem('triggerCheckIn');
      }
    }
  }, [location, userRole]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const contextValue = {
    isOpen: isSidebarOpen,
    isMobileMenuOpen,
    toggleMobileMenu,
    toggleSidebar,
    windowWidth
  };

  // Navigation items with role-based filtering
  const navigationItems = React.useMemo(() => {
    const allItems = [
      {
        name: "Dashboard",
        icon: <Home size={18} className="font-bold" />,
        path: "/dashboard",
        allowedRoles: ["admin", "cashier", "manager", "chef", "waiter"]
      },
      {
        name: "Sales",
        icon: <Users2 size={18} className="font-bold" />,
        path: "/dashboard/sales",
        allowedRoles: ["admin", "cashier"],
        disabled: true // TEMPORARILY DISABLED
      },
      {
        name: "Manage Orders",
        icon: <LayoutDashboard size={18} className="font-bold" />,
        path: "/dashboard/manage-orders",
        allowedRoles: ["admin", "cashier"],
        disabled: true // TEMPORARILY DISABLED
      },
      {
        name: "Reservations",
        icon: <Clock size={18} className="font-bold" />,
        path: "/dashboard/reservations",
        allowedRoles: ["admin", "cashier"]
      },
      {
        name: "Customer Management",
        icon: <User size={18} className="font-bold" />,
        path: "/dashboard/customer-management",
        allowedRoles: ["admin", "cashier"]
      },
      {
        name: "Coupon & Discount",
        icon: <Tag size={18} className="font-bold" />,
        path: "/dashboard/coupons",
        allowedRoles: ["admin", "manager", "cashier"]
      },
      {
        name: "All Reports",
        icon: <BarChart3 size={18} className="font-bold" />,
        path: "/dashboard/reports",
        allowedRoles: ["admin", "manager", "cashier"],
        disabled: true // TEMPORARILY DISABLED
      },
      {
        name: "KDS",
        icon: <Search size={18} className="font-bold" />,
        path: "/dashboard/kds",
        allowedRoles: ["admin", "bde", "cashier"]
      },
      {
        name: "Admin",
        icon: <Settings size={18} className="font-bold" />,
        path: "/dashboard/admin-panel",
        allowedRoles: ["admin"]
      },
      {
        name: "Customer Display",
        icon: <Settings size={18} className="font-bold" />,
        path: "/customer",
        allowedRoles: ["admin"]
      }
    ];

    return allItems.filter(item => item.allowedRoles.includes(userRole));
  }, [userRole]);

  // Check if current route is KDS or Orders
  const isKDSRoute = location.pathname === '/dashboard/kds';
  const isOrdersRoute = location.pathname === '/dashboard/sales';
  const isReservationsRoute = location.pathname === '/dashboard/reservations';
  const shouldHideSidebar = isOrdersRoute;

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarContext.Provider value={contextValue}>
      {/* Dashboard Slider Overlay */}
      {showDashboardSlider && (
        <div className="fixed inset-0 z-50 flex">
          {/* Dashboard Slider */}
          <div 
            className="w-64 h-full shadow-2xl transform transition-transform duration-300 ease-in-out rounded-r-xl"
            style={{ backgroundColor: themeColors.primary }}
          >
            {/* Header */}
            <div 
              className="p-4 border-b flex justify-between items-center"
              style={{ borderColor: 'rgba(255, 255, 255, 0.23)' }}
            >
              <div className="cursor-pointer">
                <h1 className="font-bold text-white text-xl">
                  G
                  <span className="text-secondary">POS</span>
                  System
                </h1>
              </div>
              <button 
                onClick={() => setShowDashboardSlider(false)}
                className="p-2 rounded-full text-white transition-colors"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.23)',
                  ':hover': { backgroundColor: 'rgba(255, 255, 255, 0.39)' }
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Menu Items - Using the same navigationItems as main sidebar */}
            <nav className="mt-3 flex flex-col h-full">
              <div className="flex-1">
                {navigationItems.map((item) => (
                  <div key={item.name}>
                                         <button
                      onClick={async () => {
                        // Check if item is disabled
                        if (item.disabled) {
                          return; // Don't navigate if disabled
                        }
                        
                        setShowDashboardSlider(false);
                        
                        // Check if this is the sales route and check register status
                        if (item.path === '/dashboard/sales') {
                          try {
                            // Get the last register entry from database
                            // Using getAllRegisters as workaround since getLastRegister might not be registered yet
                            const allRegistersResult = await window.myAPI?.getAllRegisters();
                            const lastRegisterResult = allRegistersResult && allRegistersResult.success && allRegistersResult.data && allRegistersResult.data.length > 0 
                              ? { success: true, data: allRegistersResult.data[0] } // First item is the last register
                              : { success: true, data: null };
                            
                            if (lastRegisterResult && lastRegisterResult.success && lastRegisterResult.data) {
                              const lastRegister = lastRegisterResult.data;
                              
                              // Check if the last register is closed (isclosed = 1)
                              // If isclosed = 1 (closed), show popup to open new register
                              // If isclosed = 0 (open), no popup needed, go directly to sales
                              if (lastRegister.isclosed === 1) {
                                setShowCheckIn(true);
                                return; // Don't navigate yet, wait for check-in completion
                              }
                            } else {
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
                        
                        // Normal navigation for other routes or if already checked in
                        navigate(item.path);
                      }}
                     className={`w-full flex items-center px-4 py-3 text-sm text-gray-100 transition-colors ${
                       item.disabled ? 'opacity-50 cursor-not-allowed' : ''
                     }`}
                     style={{ 
                       ':hover': { backgroundColor: 'rgba(255, 255, 255, 0.055)' }
                     }}
                     onMouseEnter={(e) => {
                       if (!item.disabled) {
                         e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.055)';
                       }
                     }}
                     onMouseLeave={(e) => {
                       if (!item.disabled) {
                         e.target.style.backgroundColor = 'transparent';
                       }
                     }}
                     disabled={item.disabled}
                    >
                      {item.disabled ? (
                        <Lock size={16} className="text-gray-100" />
                      ) : (
                        <span className="text-gray-100">{item.icon}</span>
                      )}
                      <span className="ml-2 font-medium whitespace-nowrap">
                        {item.name}
                      </span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Logout Button */}
              <div className="px-4 mb-6 cursor-pointer">
                <button
                  onClick={async () => {
                    setShowDashboardSlider(false);
                    
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
                      
                      // Navigate to login
                      navigate('/login');
                    } catch (error) {
                      console.error('Error during logout:', error);
                      // Still navigate to login even if logout fails
                      localStorage.removeItem('currentEmployee');
                      sessionStorage.clear();
                      navigate('/login');
                    }
                  }}
                  className="w-full flex items-center cursor-pointer gap-2 py-3 text-gray-100"
                >
                  <LogOut 
                    size={20} 
                    className="font-bold flex-shrink-0" 
                    style={{ opacity: 1 }}
                  />
                  <span className="font-medium">
                    Logout
                  </span>
                </button>
              </div>
            </nav>
          </div>
          
          {/* Backdrop - click to close */}
          <div 
            className="flex-1 cursor-pointer"
            onClick={() => setShowDashboardSlider(false)}
          ></div>
        </div>
      )}

      <div className="dashboard-container">
        {/* Check-In Popup */}
        {showCheckIn && (
          <CheckInFlow onComplete={(shouldNavigate = false) => {
            setShowCheckIn(false);
            // Only navigate to sales if explicitly requested (e.g., after successful register creation)
            if (shouldNavigate) {
              navigate('/dashboard/sales');
            }
          }} />
        )}
        
        <div className="dashboard-content">
          <div className={`flex ${shouldHideSidebar? "h-full" : "h-full"} overflow-hidden`}>
            {/* Conditionally render Sidebar */}
            {!shouldHideSidebar && <Sidebar navigationItems={navigationItems} />}
            
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Conditional Header Rendering */}
              {isOrdersRoute ? (
                // Show OrdersHeader for sales route
                <OrdersHeader 
                  isOrdersRoute={isOrdersRoute} 
                  onMenuClick={() => setShowDashboardSlider(true)}
                  showMenuButton={false}
                  onDraftsClick={() => {
                    // This will be handled by the RunningOrders component
                    window.dispatchEvent(new CustomEvent('openDraftsModal'));
                  }}
                />
              ) : isReservationsRoute ? (
                // Show Reservations toolbar under title bar with proper margins when sidebar is visible
                <div className={shouldHideSidebar ? "" : "md:pl-5"}>
                  <ReservationsHeader />
                </div>
              ) : null}
         
              <main className="dashboard-main">
                <div className={`dashboard-scrollable rounded-br-xl ${
                  shouldHideSidebar ? 'p-0' : 'p-2'
                } ${
                  shouldHideSidebar ? '' : 'md:ml-2'
                } ${
                  isOrdersRoute || isReservationsRoute ? '' : 'mt-6 md:mt-3'
                }`}
                  style={{
                    transition: 'margin 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: shouldHideSidebar ? 'transparent' : themeColors.dashboardBackground
                  }}
                >
                  <Outlet />
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default DashboardLayout;