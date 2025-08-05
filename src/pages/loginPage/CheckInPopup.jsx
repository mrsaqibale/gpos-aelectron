
import React, { useState, useEffect } from 'react';
import { CheckCircle, Save, ArrowRight } from 'lucide-react';

const CheckInFlow = ({ onComplete }) => {
  const [showSuccess, setShowSuccess] = useState(true);
  const [showCashInput, setShowCashInput] = useState(false);
  const [openingCash, setOpeningCash] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleNumberClick = (number) => {
    setOpeningCash(prev => {
      // Prevent multiple decimal points
      if (number === '.' && prev.includes('.')) return prev;
      return prev + number;
    });
  };

  const handleBackspace = () => {
    setOpeningCash(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setOpeningCash('');
  };


  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
    
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleRegisterClick = () => {
    setShowCashInput(true);
  };

  const handleSave = async () => {
    if (!openingCash || parseFloat(openingCash) <= 0) {
      setError('Please enter a valid opening cash amount');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      // Get current employee from localStorage
      const currentEmployee = JSON.parse(localStorage.getItem('currentEmployee'));
      
      if (!currentEmployee || !currentEmployee.id) {
        setError('No employee data found. Please login again.');
        setIsSaving(false);
        return;
      }

      // Create register entry
      const registerData = {
        startamount: parseFloat(openingCash) || 0,
        employee_id: currentEmployee.id
      };

      console.log('Creating register with data:', registerData);
      
      const result = await window.myAPI?.createRegister(registerData);
      
      if (result && result.success) {
        console.log('Register created successfully:', result.data);
        // Store register info in localStorage for later use
        localStorage.setItem('currentRegister', JSON.stringify(result.data));
        onComplete();
      } else {
        setError(result?.message || 'Failed to create register');
        setIsSaving(false);
      }
    } catch (error) {
      console.error('Error creating register:', error);
      setError('Network error. Please try again.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0000009a] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl w-full max-w-md transform transition-all duration-300">
        {/* Header - No close button */}
        <div className="bg-[#032D3A] p-4 flex justify-center items-center">
          <h3 className="text-white font-bold text-lg">
            {!showCashInput ? 'Check-In Successful' : 'Register Cash Drawer'}
          </h3>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showCashInput ? (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500 animate-bounce" />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">
                You are now checked in
              </h4>
              <p className="text-gray-600 mb-6">
                at {currentTime}
              </p>
              <button
                onClick={handleRegisterClick}
                className="bg-[#032D3A] hover:bg-[#2d5a87] text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 mx-auto"
              >
                Start Register <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Enter Opening Cash Amount
                </label>
                <div className="bg-gray-100 p-4 rounded-lg text-2xl font-mono text-right">
                  {openingCash || '0.00'}
                </div>
              </div>

              {/* Numeric Pad */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleNumberClick(num.toString())}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 rounded-lg transition-colors"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={handleBackspace}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 rounded-lg transition-colors"
                >
                  ⌫
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleClear}
                  disabled={isSaving}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  Clear
                </button>
                <button
                  onClick={handleSave}
                  disabled={!openingCash || parseFloat(openingCash) <= 0 || isSaving}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors ${
                    openingCash && parseFloat(openingCash) > 0 && !isSaving
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckInFlow;