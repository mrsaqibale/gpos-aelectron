import React, { useState, useEffect } from 'react';
import { Minus, Square, X, Maximize2 } from 'lucide-react';

// Default theme colors
const defaultThemeColors = {
  primary: '#032d81',
  primaryLight: '#20407f'
};

const CustomTitleBar = () => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [themeColors, setThemeColors] = useState(defaultThemeColors);

  // Try to get theme colors from context if available
  useEffect(() => {
    const getThemeColors = () => {
      try {
        // Check if theme context is available
        const savedTheme = localStorage.getItem('posTheme');
        if (savedTheme) {
          const themes = {
            default: {
              primary: '#003C58',
              primaryLight: '#005a9c',
            },
            blue: {
              primary: '#032D81',
              primaryLight: '#4f8cff',
            },
            green: {
              primary: '#136F63',
              primaryLight: '#1a8a7a',
            },
          };
          
          if (themes[savedTheme]) {
            setThemeColors(themes[savedTheme]);
          }
        }
      } catch (error) {
        console.log('Using default theme colors');
      }
    };

    getThemeColors();

    // Listen for theme changes
    const handleStorageChange = (e) => {
      if (e.key === 'posTheme') {
        getThemeColors();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom theme change events
    const handleThemeChange = () => {
      getThemeColors();
    };
    
    window.addEventListener('themeChanged', handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);

  useEffect(() => {
    // Check initial maximize state
    const checkMaximized = async () => {
      try {
        const maximized = await window.windowControls?.isMaximized();
        setIsMaximized(maximized);
      } catch (error) {
        console.error('Error checking maximize state:', error);
      }
    };
    
    checkMaximized();

    // Listen for maximize/unmaximize events
    const handleMaximize = () => setIsMaximized(true);
    const handleUnmaximize = () => setIsMaximized(false);

    window.windowControls?.onMaximizeChange(handleMaximize);
    window.windowControls?.onUnmaximizeChange(handleUnmaximize);

    return () => {
      // Cleanup listeners if needed
    };
  }, []);

  const handleMinimize = () => {
    window.windowControls?.minimize();
  };

  const handleMaximize = () => {
    window.windowControls?.maximize();
  };

  const handleClose = () => {
    window.windowControls?.close();
  };

  return (
    <div 
      className="fixed top-0 left-0 right-0 h-8 z-50 flex items-center justify-between px-4 select-none title-bar"
      style={{ 
        backgroundColor: themeColors.primary,
        borderBottom: `1px solid ${themeColors.primaryLight}`
      }}
    >
      {/* Left side - App title */}
      <div className="flex items-center">
        <span className="text-white text-sm font-semibold">POS System</span>
      </div>

      {/* Right side - Window controls */}
      <div className="flex items-center space-x-1">
        {/* Minimize button */}
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

        {/* Maximize/Restore button */}
        <button
          onClick={handleMaximize}
          className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white transition-colors duration-200 rounded-sm"
          style={{ 
            '--hover-bg-color': themeColors.primaryLight 
          }}
          title={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? (
            <Square className="w-3 h-3" />
          ) : (
            <Maximize2 className="w-3 h-3" />
          )}
        </button>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-red-600 transition-colors duration-200 rounded-sm"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CustomTitleBar; 