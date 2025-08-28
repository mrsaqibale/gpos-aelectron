import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useHotelStatus = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLicensed, setIsLicensed] = useState(false);
  const [hotelInfo, setHotelInfo] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const checkStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if hotel table exists and has data
      const tableCheck = await window.myAPI.checkHotelTable();
      if (!tableCheck.success) {
        throw new Error('Failed to check hotel table');
      }

      if (!tableCheck.tableExists || !tableCheck.hasData) {
        // No hotel record exists, redirect to license screen
        console.log('No hotel record found, redirecting to license screen');
        setIsLicensed(false);
        navigate('/license');
        return;
      }

      // Check hotel status
      const statusResult = await window.myAPI.checkHotelStatus();
      if (!statusResult.success) {
        throw new Error(statusResult.message || 'Failed to check hotel status');
      }

      setIsLicensed(statusResult.isLicensed);
      setHotelInfo(statusResult);

      // If not licensed, redirect to license screen
      if (!statusResult.isLicensed) {
        console.log('Hotel not licensed, redirecting to license screen');
        navigate('/license');
      } else {
        console.log('Hotel is licensed, staying on current page');
      }

    } catch (err) {
      console.error('Error checking hotel status:', err);
      setError(err.message);
      // On error, redirect to license screen as fallback
      navigate('/license');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const refreshStatus = () => {
    checkStatus();
  };

  return {
    isLoading,
    isLicensed,
    hotelInfo,
    error,
    refreshStatus
  };
};
