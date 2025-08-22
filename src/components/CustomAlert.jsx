import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

const CustomAlert = ({ 
  message, 
  isVisible, 
  onClose, 
  duration = 3000, 
  type = 'success'
}) => {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true);
    } else {
      setIsShowing(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const getAlertStyles = () => {
    const baseStyles = "w-[350px] fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-xl shadow-2xl transition-all duration-300 ease-out";
  
    // Type styles
    const typeStyles = {
      success: 'border-2 border-primary',
      error: 'border-2 border-red-500',
      warning: 'border-2 border-yellow-500',
      info: 'border-2 border-blue-500'
    };

    const visibilityStyles = isShowing 
      ? 'opacity-100 translate-y-0' 
      : 'opacity-0 translate-y-8';

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
          <div className={`w-6 h-6 rounded-full ${iconStyles[type]} flex items-center justify-center`}>
            <Check size={16} className={iconColor[type]} />
          </div>
        );
      case 'error':
        return (
          <div className={`w-6 h-6 rounded-full ${iconStyles[type]} flex items-center justify-center`}>
            <X size={16} className={iconColor[type]} />
          </div>
        );
      case 'warning':
        return (
          <div className={`w-6 h-6 rounded-full ${iconStyles[type]} flex items-center justify-center`}>
            <span className={`text-2xl ${iconColor[type]}`}>⚠</span>
          </div>
        );
      case 'info':
        return (
          <div className={`w-6 h-6 rounded-full ${iconStyles[type]} flex items-center justify-center`}>
            <span className={`text-2xl ${iconColor[type]}`}>ℹ</span>
          </div>
        );
      default:
        return (
          <div className={`w-6 h-6 rounded-full ${iconStyles.success} flex items-center justify-center`}>
            <Check size={16} className="text-white" />
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

  return (
    <div className={getAlertStyles()}>
      <div className="p-4 text-center flex flex-col items-center justify-center">
        <div className='flex items-center justify-center gap-2'>
        {getIcon()}
        <h3 className={`text-xl font-semibold mb-2 ${getTypeColor()}`}>
          {getTypeTitle()}
        </h3>
        </div>
        <p className="text-gray-600 mb-4 text-sm">
          {message}
        </p>
      </div>
    </div>
  );
};

export default CustomAlert;
