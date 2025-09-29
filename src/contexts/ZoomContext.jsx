import React, { createContext, useContext, useState, useEffect } from 'react';

const ZoomContext = createContext();

export const ZoomProvider = ({ children }) => {
  const [zoomLevel, setZoomLevel] = useState(() => {
    const savedZoom = localStorage.getItem('posZoomLevel');
    return savedZoom ? parseFloat(savedZoom) : 1.0;
  });

  // Save zoom level to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('posZoomLevel', zoomLevel.toString());
  }, [zoomLevel]);

  // Apply zoom to the entire document
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--zoom-level', zoomLevel);
    
    // Apply zoom using CSS zoom property (most browser-like behavior)
    root.style.zoom = zoomLevel;
    
    // Fallback for browsers that don't support CSS zoom
    if (root.style.zoom === '') {
      // Use transform as fallback
      root.style.transform = `scale(${zoomLevel})`;
      root.style.transformOrigin = 'center top';
      
      // Adjust body dimensions to prevent overflow
      const body = document.body;
      const html = document.documentElement;
      
      // Calculate the inverse scale to maintain proper dimensions
      const inverseScale = 1 / zoomLevel;
      body.style.width = `${window.innerWidth * inverseScale}px`;
      body.style.height = `${window.innerHeight * inverseScale}px`;
      body.style.overflow = 'hidden';
      
      // Ensure html takes full viewport
      html.style.width = '100vw';
      html.style.height = '100vh';
      html.style.overflow = 'hidden';
    }
    
    // Handle window resize to maintain proper zoom
    const handleResize = () => {
      if (root.style.zoom === '') {
        const body = document.body;
        const inverseScale = 1 / zoomLevel;
        body.style.width = `${window.innerWidth * inverseScale}px`;
        body.style.height = `${window.innerHeight * inverseScale}px`;
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      // Cleanup on unmount
      window.removeEventListener('resize', handleResize);
      root.style.zoom = '';
      root.style.transform = '';
      root.style.transformOrigin = '';
      root.style.width = '';
      root.style.height = '';
      root.style.overflow = '';
      
      const body = document.body;
      body.style.width = '';
      body.style.height = '';
      body.style.overflow = '';
    };
  }, [zoomLevel]);

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2.0)); // Max zoom 200%
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5)); // Min zoom 50%
  };

  const resetZoom = () => {
    setZoomLevel(1.0);
  };

  const value = {
    zoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoomLevel,
  };

  return (
    <ZoomContext.Provider value={value}>
      {children}
    </ZoomContext.Provider>
  );
};

export const useZoom = () => {
  const context = useContext(ZoomContext);
  if (!context) {
    throw new Error('useZoom must be used within a ZoomProvider');
  }
  return context;
};

