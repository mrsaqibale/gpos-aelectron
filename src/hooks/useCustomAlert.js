import { useState, useCallback } from 'react';

const useCustomAlert = () => {
  const [alertState, setAlertState] = useState({
    isVisible: false,
    message: '',
    type: 'success',
    position: 'top-right',
    duration: 1000
  });

  const showAlert = useCallback((message, options = {}) => {
    setAlertState({
      isVisible: true,
      message,
      type: options.type || 'success',
      position: options.position || 'top-right',
      duration: options.duration || 1000
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, isVisible: false }));
  }, []);

  // Convenience methods for different alert types
  const showSuccess = useCallback((message, options = {}) => {
    showAlert(message, { ...options, type: 'success' });
  }, [showAlert]);

  const showError = useCallback((message, options = {}) => {
    showAlert(message, { ...options, type: 'error' });
  }, [showAlert]);

  const showWarning = useCallback((message, options = {}) => {
    showAlert(message, { ...options, type: 'warning' });
  }, [showAlert]);

  const showInfo = useCallback((message, options = {}) => {
    showAlert(message, { ...options, type: 'info' });
  }, [showAlert]);

  return {
    alertState,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};

export default useCustomAlert;
