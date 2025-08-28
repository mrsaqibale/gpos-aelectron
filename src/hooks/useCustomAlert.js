import { useState, useCallback, useRef } from 'react';

const useCustomAlert = () => {
  const [alertState, setAlertState] = useState({
    isVisible: false,
    message: '',
    type: 'success',
    position: 'top-right',
    duration: 1000
  });

  // Use a ref to track if an alert is currently being shown
  const isAlertVisibleRef = useRef(false);
  const timeoutRef = useRef(null);

  const showAlert = useCallback((message, options = {}) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set the alert state immediately
    setAlertState({
      isVisible: true,
      message,
      type: options.type || 'success',
      position: options.position || 'top-right',
      duration: options.duration || 1000
    });

    isAlertVisibleRef.current = true;

    // Set a timeout to hide the alert
    timeoutRef.current = setTimeout(() => {
      setAlertState(prev => ({ ...prev, isVisible: false }));
      isAlertVisibleRef.current = false;
      timeoutRef.current = null;
    }, options.duration || 1000);
  }, []);

  const hideAlert = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setAlertState(prev => ({ ...prev, isVisible: false }));
    isAlertVisibleRef.current = false;
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
