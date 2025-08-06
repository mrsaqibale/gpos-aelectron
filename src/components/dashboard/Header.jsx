import React, { useContext, useState, useEffect } from 'react';
import { 
  Menu, ShoppingCart, Download, ClipboardList, 
  ArrowLeft, Bell, RotateCcw, Calendar, Eye, LogOut 
} from 'lucide-react';
import { SidebarContext } from './DashboardLayout';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = ({ 
  onRecallClick,
  onNotificationsClick, 
  onViewToggle,
  currentView,
  notificationCount = 0 
}) => {
  const { toggleMobileMenu, windowWidth } = useContext(SidebarContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get logged-in user data
  const [user, setUser] = useState({
    name: 'Loading...',
    role: 'Loading...'
  });

  useEffect(() => {
    // Get user data from localStorage
    const currentEmployee = localStorage.getItem('currentEmployee');
    if (currentEmployee) {
      try {
        const employeeData = JSON.parse(currentEmployee);
        setUser({
          name: `${employeeData.fname || ''} ${employeeData.lname || ''}`.trim() || 'Unknown User',
          role: employeeData.roll || 'Unknown Role'
        });
      } catch (error) {
        console.error('Error parsing employee data:', error);
        setUser({
          name: 'Unknown User',
          role: 'Unknown Role'
        });
      }
    } else {
      // If no user data, redirect to login
      navigate('/login');
    }
  }, [navigate]);

  // Default buttons configuration
  const defaultButtons = [
    {
      icon: <ShoppingCart size={14} />,
      onClick: () => console.log("Sale clicked"),
      label: "Sale"
    },
    {
      icon: <Download size={14} />,
      onClick: () => console.log("Download clicked"),
      label: "Report"
    },
    {
      icon: <ClipboardList size={14} />,
      onClick: () => console.log("Manage Orders clicked"),
      label: " manage Orders"
    }
  ];

  // KDS specific buttons
  const kdsButtons = [
    {
      icon: <RotateCcw size={14} />,
      onClick: onRecallClick,
      label: "Recall"
    },
    {
      icon: <Bell size={14} />,
      onClick: onNotificationsClick,
      label: "Notifications",
      hasNotification: notificationCount > 0
    },
    {
      icon: currentView === 'cards' ? <Calendar size={14} /> : <Eye size={14} />,
      onClick: onViewToggle,
      label: currentView === 'cards' ? 'Card View' : 'All Day View'
    }
  ];

  const handleBack = () => {
    // Always navigate to the previous page in history
    navigate(-1);
  };

  const handleLogout = async () => {
    try {
      // Get current employee data before clearing
      const currentEmployee = localStorage.getItem('currentEmployee');
      let employeeId = null;
      
      if (currentEmployee) {
        try {
          const employeeData = JSON.parse(currentEmployee);
          employeeId = employeeData.id;
        } catch (error) {
          console.error('Error parsing employee data for logout:', error);
        }
      }

      // Update employee logout session if we have an employee ID
      if (employeeId) {
        try {
          const logoutResult = await window.myAPI?.updateEmployeeLogout(employeeId);
          if (logoutResult.success) {
            console.log('Employee logout session updated successfully:', logoutResult);
          } else {
            console.warn('Failed to update logout session:', logoutResult.message);
          }
        } catch (error) {
          console.error('Error updating logout session:', error);
        }
      }

      // Clear user data from localStorage
      localStorage.removeItem('currentEmployee');
      
      // Clear session storage to reset check-in state
      sessionStorage.removeItem('hasCheckedIn');
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear data and redirect even if logout session update fails
      localStorage.removeItem('currentEmployee');
      sessionStorage.removeItem('hasCheckedIn');
      navigate('/login');
    }
  };

  const showBackButton = location.pathname !== '/dashboard';
  const isKDSRoute = location.pathname.includes('/kds');
  const buttonsToShow = isKDSRoute ? kdsButtons : defaultButtons;

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 rounded-lg shadow-md">
      <div className="flex items-center justify-between w-full px-4 py-1.5">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          {windowWidth < 1024 && (
            <button
              onClick={toggleMobileMenu}
              className="p-1 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} className="text-gray-600" />
            </button>
          )}
          
          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-2 ml-2">
            {buttonsToShow.map((button, index) => (
              <div key={index} className="relative group">
                <button
                  onClick={button.onClick}
                  className="p-2 bg-primary cursor-pointer text-white hover:bg-primary/90 rounded-lg flex items-center justify-center relative"
                >
                  {button.icon}
                  
                  {/* Notification Badge for Bell icon */}
                  {button.hasNotification && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notificationCount}
                    </span>
                  )}
                </button>

                {/* Tooltip */}
                <div className={`absolute ${isKDSRoute ? 'left-1/2 -translate-x-1/2 top-full mt-2' : 'top-full left-1/2 transform -translate-x-1/2 mt-2'} px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10`}>
                  {button.label}
                  <div className={`absolute ${isKDSRoute ? 'bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800' : 'bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800'}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Right Section */}
        <div className="flex items-center gap-5">
          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500 font-medium">
                {user.role}
              </p>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
          
          {/* Back Button - Show on all routes except the main dashboard */}
          {showBackButton && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-white cursor-pointer rounded-lg transition-colors duration-200 border border-gray-200"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Action Buttons */}
      {windowWidth < 1024 && (
        <div className="px-4 pb-3 flex gap-2">
          {buttonsToShow.map((button, index) => (
            <button
              key={index}
              onClick={button.onClick}
              className="p-2 bg-primary text-white hover:bg-primary/90 rounded-lg flex items-center gap-1 relative"
              title={button.label}
            >
              {button.icon}
              <span className="text-xs ml-1">{button.label}</span>
              {button.hasNotification && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;