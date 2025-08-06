import React, { useState, createContext, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import OrdersHeader from './OrdersHeader'; // Import the new OrdersHeader component
import { Outlet, useLocation } from 'react-router-dom';
import CheckInFlow from '../../pages/loginPage/CheckInPopup';
import {
  LayoutDashboard,
  Search,
  Users2, Utensils, Table
} from 'lucide-react';

export const SidebarContext = createContext();

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const location = useLocation();
  
  // Mock user data for frontend demo
  const user = {
    role: 'cashier', 
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

  if (location.pathname === '/dashboard' && userRole !== 'admin' && !hasCheckedIn) {
    setShowCheckIn(true);
    sessionStorage.setItem('hasCheckedIn', 'true');
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
        name: "Food Management",
        icon: <Utensils size={18} />,
        path: "/dashboard/food-management",
        allowedRoles: ["admin", "cashier"]
      },
      {
        name: "Employee Management",
        icon: <Users2 size={18} />,
        path: "/dashboard/employee-management",
        allowedRoles: ["admin", "cashier"]
      },
      {
        name: "Table Management",
        icon: <Table size={18} />,
        path: "/dashboard/table-management",
        allowedRoles: ["admin", "cashier"]
      },
      {
        name: "sales",
        icon: <Users2 size={18} />,
        path: "/dashboard/sales",
        allowedRoles: ["admin", "cashier"]
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
      <div className={`min-h-screen ${shouldHideSidebar ? 'bg-[#d3d3d3] p-0' : 'bg-bgColor p-2'} p-2 md:p-2`}>
        {/* Check-In Popup */}
        {showCheckIn && (
          <CheckInFlow onComplete={() => setShowCheckIn(false)} />
        )}
        
        <div className={`flex ${shouldHideSidebar? "h-[calc(100vh-17px)] ":"h-[calc(100vh-24px)] "} overflow-hidden rounded-xl`}>
          {/* Conditionally render Sidebar */}
          {!shouldHideSidebar && <Sidebar navigationItems={navigationItems} />}
          
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Conditional Header Rendering */}
            {isOrdersRoute ? (
              // Show OrdersHeader for sales route
              <OrdersHeader isOrdersRoute={isOrdersRoute} />
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
         
            <main
              className={`flex-1 overflow-auto rounded-br-xl ${
                shouldHideSidebar ? 'bg-[#d3d3d3] p-0 ' : 'bg-bgColor p-2'
              } ${
                shouldHideSidebar ? '' : 'md:ml-2'
              } ${
                isKDSRoute ? '' : 'mt-6 md:mt-3'
              }`}
              style={{
                transition: 'margin 300ms cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default DashboardLayout;