import React, { useState, useEffect } from 'react';
import { Minus, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const CustomTitleBar = () => {
  // const [isMaximized, setIsMaximized] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const location = useLocation();
  const { themeColors, changeTheme } = useTheme();

  // Check if user is logged in
  const isLoggedIn = () => {
    const currentEmployee = localStorage.getItem('currentEmployee');
    return currentEmployee !== null;
  };

  // Check if user is on login page
  const isOnLoginPage = () => {
    return location.pathname === '/login' || location.pathname === '/';
  };

  // Update time every minute
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };

    // Update immediately
    updateTime();

    // Set interval to update every minute
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  // useEffect(() => {
  //   // Check initial maximize state
  //   const checkMaximized = async () => {
  //     try {
  //       const maximized = await window.windowControls?.isMaximized();
  //       setIsMaximized(maximized);
  //     } catch (error) {
  //       console.error('Error checking maximize state:', error);
  //     }
  //   };
    
  //   checkMaximized();

  //   // Listen for maximize/unmaximize events
  //   const handleMaximize = () => setIsMaximized(true);
  //   const handleUnmaximize = () => setIsMaximized(false);

  //   window.windowControls?.onMaximizeChange(handleMaximize);
  //   window.windowControls?.onUnmaximizeChange(handleUnmaximize);

  //   return () => {
  //     // Cleanup listeners if needed
  //   };
  // }, []);

  const handleMinimize = () => {
    window.windowControls?.minimize();
  };

  // const handleMaximize = () => {
  //   window.windowControls?.maximize();
  // };

  // const handleClose = () => {
  //   window.windowControls?.close();
  // };

  const handleLogout = async () => {
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
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatDay = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  return (
    <div 
      className="fixed top-0 left-0 right-0 h-9 z-50 flex items-center justify-between px-4 select-none title-bar"
      style={{ 
        backgroundColor: themeColors.primary,
        borderBottom: `1px solid ${themeColors.primaryLight}`
      }}
    >
              {/* Left side - App title and logout button */}
        <div className="flex items-center space-x-3">
          {isOnLoginPage() ? (
            <span className="text-white text-sm font-semibold">POS System</span>
          ) : isLoggedIn() ? (
            <button
              onClick={handleLogout}
              className="flex cursor-pointer items-center space-x-1 text-gray-300 hover:text-white transition-colors duration-200 rounded-sm px-2 py-1 hover:bg-red-600"
              title="Logout"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-semibold">Logout</span>
            </button>
          ) : (
            <span className="text-white text-sm font-semibold">POS System</span>
          )}
        </div>

      {/* Middle section - Time and Date */}
      <div className="flex items-center space-x-4">
        {/* Clock icon */}
        <div className="w-4 h-4 relative mr-2">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 stroke-white stroke-2">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="none"/>
            <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        
        {/* Time */}
        <span className="text-white text-md font-bold">
          {formatTime(currentTime)}
        </span>
        
        {/* Date */}
        <span className="text-white text-sm font-semibold">
          {formatDate(currentTime)}
        </span>
        
        {/* Day */}
        <span className="text-white text-sm font-semibold">
          {formatDay(currentTime)}
        </span>
      </div>

      {/* Right side - Theme switcher and Window controls */}
      <div className="flex items-center space-x-2">
        {/* Theme switcher buttons */}
        <div className="flex items-center space-x-1 mr-2">
          <button
            onClick={() => changeTheme("default")}
            className="w-4 h-4 rounded-full border border-white cursor-pointer transform active:scale-95"
            style={{ background: "linear-gradient(to bottom right, #003E5C, #1976d2)" }}
            title="Default Theme"
          />
          <button
            onClick={() => changeTheme("blue")}
            className="w-4 h-4 rounded-full border border-white cursor-pointer transform active:scale-95"
            style={{ background: "linear-gradient(to bottom right, #176B87, #3498db)" }}
            title="Blue Theme"
          />
          <button
            onClick={() => changeTheme("green")}
            className="w-4 h-4 rounded-full border border-white cursor-pointer transform active:scale-95"
            style={{ background: "linear-gradient(to bottom right, #25A18E, #34A0A4)" }}
            title="Green Theme"
          />
          <button
            onClick={() => changeTheme("black")}
            className="w-4 h-4 rounded-full border border-white cursor-pointer transform active:scale-95"
            style={{ background: "linear-gradient(to bottom right, #1a1a1a, #333333)" }}
            title="Black Theme"
          />
        </div>

        {/* Window controls */}
        <div className="flex items-center space-x-1">
          {/* Minimize button only */}
          <button
            onClick={handleMinimize}
            className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white transition-colors duration-200 rounded-sm"
            style={{ 
              '--hover-bg-color': themeColors.primaryLight 
            }}
            title="Minimize"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomTitleBar; 