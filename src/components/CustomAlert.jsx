import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

const CustomAlert = ({ 
  message, 
  isVisible, 
  onClose, 
  duration = 1000, 
  type = 'success',
  position = 'top-right' 
}) => {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true);
      const timer = setTimeout(() => {
        setIsShowing(false);
        setTimeout(() => {
          onClose && onClose();
        }, 300); // Wait for fade out animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getAlertStyles = () => {
    const baseStyles = "fixed z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform";
    
    // Position styles
    const positionStyles = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };

    // Type styles
    const typeStyles = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      warning: 'bg-yellow-500 text-white',
      info: 'bg-blue-500 text-white'
    };

    const visibilityStyles = isShowing 
      ? 'opacity-100 translate-y-0' 
      : 'opacity-0 translate-y-2';

    return `${baseStyles} ${positionStyles[position]} ${typeStyles[type]} ${visibilityStyles}`;
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check size={20} className="flex-shrink-0" />;
      case 'error':
        return <X size={20} className="flex-shrink-0" />;
      case 'warning':
        return <span className="flex-shrink-0 text-lg">⚠</span>;
      case 'info':
        return <span className="flex-shrink-0 text-lg">ℹ</span>;
      default:
        return <Check size={20} className="flex-shrink-0" />;
    }
  };

  return (
    <div className={getAlertStyles()}>
      {getIcon()}
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={() => {
          setIsShowing(false);
          setTimeout(() => {
            onClose && onClose();
          }, 300);
        }}
        className="ml-2 hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default CustomAlert;
