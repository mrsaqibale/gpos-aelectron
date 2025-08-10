import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

const CustomAlert = ({ 
  message, 
  isVisible, 
  onClose, 
  duration = 1000, 
  type = 'success'
}) => {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true);
      const timer = setTimeout(() => {
        setIsShowing(false);
        setTimeout(() => {
          onClose && onClose();
        }, 1000); // Wait for fade out animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getAlertStyles = () => {
    const baseStyles = "w-[400px] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl shadow-2xl transition-all duration-300";
  
    // // Position styles
    // const positionStyles = {
    //   'top-right': 'fixed top-4 right-4',
    //   'top-left': 'fixed top-4 left-4',
    //   'top-center': 'fixed top-4 left-1/2 transform -translate-x-1/2',
    //   'bottom-right': 'fixed bottom-4 right-4',
    //   'bottom-left': 'fixed bottom-4 left-4',
    //   'bottom-center': 'fixed bottom-4 left-1/2 transform -translate-x-1/2',
    //   'center': 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
    // };

    // Type styles
    const typeStyles = {
      success: 'border-2 border-primary',
      error: 'border-2 border-red-500',
      warning: 'border-2 border-yellow-500',
      info: 'border-2 border-blue-500'
    };

    const visibilityStyles = isShowing 
      ? 'opacity-100 scale-100' 
      : 'opacity-0 scale-95';

    return `${baseStyles} ${typeStyles[type]} ${visibilityStyles}`;
  };

  const getIcon = () => {
    const iconStyles = {
      success: 'bg-primary',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    };

    const iconColor = {
      success: 'text-white',
      error: 'text-white',
      warning: 'text-white',
      info: 'text-white'
    };

    switch (type) {
      case 'success':
        return (
          <div className={`w-16 h-16 rounded-full ${iconStyles[type]} flex items-center justify-center mb-4`}>
            <Check size={32} className={iconColor[type]} />
          </div>
        );
      case 'error':
        return (
          <div className={`w-16 h-16 rounded-full ${iconStyles[type]} flex items-center justify-center mb-4`}>
            <X size={32} className={iconColor[type]} />
          </div>
        );
      case 'warning':
        return (
          <div className={`w-16 h-16 rounded-full ${iconStyles[type]} flex items-center justify-center mb-4`}>
            <span className={`text-2xl ${iconColor[type]}`}>⚠</span>
          </div>
        );
      case 'info':
        return (
          <div className={`w-16 h-16 rounded-full ${iconStyles[type]} flex items-center justify-center mb-4`}>
            <span className={`text-2xl ${iconColor[type]}`}>ℹ</span>
          </div>
        );
      default:
        return (
          <div className={`w-16 h-16 rounded-full ${iconStyles.success} flex items-center justify-center mb-4`}>
            <Check size={32} className="text-white" />
          </div>
        );
    }
  };

  const getTypeTitle = () => {
    switch (type) {
      case 'success':
        return 'Success!';
      case 'error':
        return 'Error!';
      case 'warning':
        return 'Warning!';
      case 'info':
        return 'Info!';
      default:
        return 'Success!';
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'success':
        return 'text-primary';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-primary';
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-primary hover:bg-primary/80';
      case 'error':
        return 'bg-red-500 hover:bg-red-600';
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'info':
        return 'bg-blue-500 hover:bg-blue-600';
      default:
        return 'bg-primary hover:bg-primary/80';
    }
  };

  return (
    <div className={getAlertStyles()}>
      <div className="p-8 text-center flex flex-col items-center justify-center">
        {getIcon()}
        <h3 className={`text-xl font-semibold mb-2 ${getTypeColor()}`}>
          {getTypeTitle()}
        </h3>
        <p className="text-gray-600 mb-6 text-sm">
          {message}
        </p>
        <button
          onClick={() => {
            setIsShowing(false);
            setTimeout(() => {
              onClose && onClose();
            }, 300);
          }}
          className={`${getButtonColor()} text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200 uppercase text-sm`}
        >
          Okay
        </button>
      </div>
    </div>
  );
};

export default CustomAlert;
