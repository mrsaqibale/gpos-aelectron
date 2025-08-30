import React, { useState, createContext, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import OrdersHeader from './OrdersHeader'; // Import the new OrdersHeader component
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import CheckInFlow from '../../pages/loginPage/CheckInPopup';
import {
  LayoutDashboard,
  Search,
  Users2, Utensils, Table,
  Tag, X, LogOut, User, Home, Settings
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
        icon: <Home size={18} />,
        path: "/dashboard",
        allowedRoles: ["admin", "cashier", "manager", "chef", "waiter"]
      },
      {
        name: "Manage-Orders",
        icon: <LayoutDashboard size={18} />,
        path: "/dashboard/manage-orders",
        allowedRoles: ["admin", "cashier"]
      },
      {
        name: "KDS",
        icon: <Search size={18} />,
        path: "/dashboard/kds",
        allowedRoles: ["admin", "bde", "cashier"]
      },
      {
        name: "Customer Management",
        icon: <User size={18} />,
        path: "/dashboard/customer-management",
        allowedRoles: ["admin", "cashier"]
      },
      {
        name: "Coupons",
        icon: <Tag size={18} />,
        path: "/dashboard/coupons",
        allowedRoles: ["admin", "manager", "cashier"]
      },
      {
        name: "sales",
        icon: <Users2 size={18} />,
        path: "/dashboard/sales",
        allowedRoles: ["admin", "cashier"]
      },
      {
        name: "Admin Panel",
        icon: <Settings size={18} />,
        path: "/dashboard/admin-panel",
        allowedRoles: ["admin"]
      },
    ];

    return allItems.filter(item => item.allowedRoles.includes(userRole));
  }, [userRole]);

  // Check if current route is KDS or Orders
  const isKDSRoute = location.pathname === '/dashboard/kds';
  const isOrdersRoute = location.pathname === '/dashboard/sales';
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
                       onClick={() => {
                         setShowDashboardSlider(false);
                         // Navigate to the item's path using React Router
                         navigate(item.path);
                       }}
                      className="w-full flex items-center px-4 py-3 text-sm text-gray-100 transition-colors"
                      style={{ 
                        ':hover': { backgroundColor: 'rgba(255, 255, 255, 0.055)' }
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.055)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      <span className="text-gray-100">{item.icon}</span>
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
                  onClick={() => {
                    setShowDashboardSlider(false);
                    // Handle logout logic here
                    console.log("Logout clicked");
                  }}
                  className="w-full flex items-center cursor-pointer gap-2 py-3 text-gray-100"
                >
                  <LogOut size={20} />
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
          <CheckInFlow onComplete={() => setShowCheckIn(false)} />
        )}
        
        <div className="dashboard-content">
          <div className={`flex ${shouldHideSidebar? "h-full" : "h-full"} overflow-hidden rounded-xl`}>
            {/* Conditionally render Sidebar */}
            {!shouldHideSidebar && <Sidebar navigationItems={navigationItems} />}
            
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Conditional Header Rendering */}
              {isOrdersRoute ? (
                // Show OrdersHeader for sales route
                <OrdersHeader 
                  isOrdersRoute={isOrdersRoute} 
                  onMenuClick={() => setShowDashboardSlider(true)}
                  onDraftsClick={() => {
                    // This will be handled by the RunningOrders component
                    window.dispatchEvent(new CustomEvent('openDraftsModal'));
                  }}
                />
              ) : isKDSRoute ? (
                // Show KDS-specific Header for KDS route
                <div className={shouldHideSidebar ? "" : "md:pl-5"}>
                  <Header 
                    onRecallClick={() => console.log("Recall clicked")}
                    onNotificationsClick={() => console.log("Notifications clicked")}
                    onViewToggle={() => console.log("View toggle clicked")}
                    currentView="cards" // or manage this state
                    notificationCount={3} // or manage this state
                  />
                </div>
              ) : (
                // Show regular Header for other routes
                <div className={shouldHideSidebar ? "" : "md:pl-5"}>
                  <Header />
                </div>
              )}
         
              <main className="dashboard-main">
                <div className={`dashboard-scrollable rounded-br-xl ${
                  shouldHideSidebar ? 'p-0' : 'p-2'
                } ${
                  shouldHideSidebar ? '' : 'md:ml-2'
                } ${
                  isKDSRoute ? '' : 'mt-6 md:mt-3'
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