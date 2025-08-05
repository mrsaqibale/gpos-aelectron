import React, { useState, useEffect } from 'react';
import { Minus, Square, X, Maximize2 } from 'lucide-react';

const CustomTitleBar = () => {
  const [isMaximized, setIsMaximized] = useState(false);

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
    <div className="fixed top-0 left-0 right-0 h-8 bg-[#032D3A] border-b border-[#2d5a87] z-50 flex items-center justify-between px-4 select-none title-bar">
      {/* Left side - App title */}
      <div className="flex items-center">
        <span className="text-white text-sm font-semibold">POS System</span>
      </div>

      {/* Right side - Window controls */}
      <div className="flex items-center space-x-1">
        {/* Minimize button */}
        <button
          onClick={handleMinimize}
          className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#2d5a87] transition-colors duration-200 rounded-sm"
          title="Minimize"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Maximize/Restore button */}
        <button
          onClick={handleMaximize}
          className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#2d5a87] transition-colors duration-200 rounded-sm"
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