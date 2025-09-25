
import React, { useState, useEffect } from 'react';
import { CheckCircle, Save, ArrowRight } from 'lucide-react';

const CheckInFlow = ({ onComplete }) => {
  // Get user name from localStorage
  const [userName, setUserName] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [showCashInput, setShowCashInput] = useState(false);
  const [openingCash, setOpeningCash] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingRegister, setIsCheckingRegister] = useState(true);

  useEffect(() => {
    const currentEmployee = localStorage.getItem('currentEmployee');
    if (currentEmployee) {
      try {
        const employeeData = JSON.parse(currentEmployee);
        const fullName = `${employeeData.fname || ''} ${employeeData.lname || ''}`.trim();
        setUserName(fullName || 'User');
      } catch (error) {
        console.error('Error parsing employee data:', error);
        setUserName('User');
      }
    } else {
      setUserName('User');
    }
  }, []);

  // Check register status when component mounts
  useEffect(() => {
    const checkRegisterStatus = async () => {
      try {
        // Get the last register entry from database
        // Using getAllRegisters as workaround since getLastRegister might not be registered yet
        const allRegistersResult = await window.myAPI?.getAllRegisters();
        const lastRegisterResult = allRegistersResult && allRegistersResult.success && allRegistersResult.data && allRegistersResult.data.length > 0 
          ? { success: true, data: allRegistersResult.data[0] } // First item is the last register
          : { success: true, data: null };
        
        console.log('CheckInPopup - allRegistersResult:', allRegistersResult);
        console.log('CheckInPopup - lastRegisterResult:', lastRegisterResult);
        
        if (lastRegisterResult && lastRegisterResult.success && lastRegisterResult.data) {
          const lastRegister = lastRegisterResult.data;
          console.log('CheckInPopup - lastRegister:', lastRegister);
          console.log('CheckInPopup - isclosed value:', lastRegister.isclosed, 'type:', typeof lastRegister.isclosed);
          
          // Check if the last register is closed (isclosed = 1)
          // If isclosed = 1 (closed), show popup to open new register
          // If isclosed = 0 (open), no popup needed, go directly to sales
          if (lastRegister.isclosed === 1) {
            console.log('CheckInPopup - Register is closed, showing welcome screen');
            setShowWelcome(true);
          } else {
            console.log('CheckInPopup - Register is open, going directly to sales');
            // Register is already open, go directly to sales
            onComplete(true);
          }
        } else {
          console.log('CheckInPopup - No register found, showing welcome screen');
          // If no register found, show welcome screen
          setShowWelcome(true);
        }
      } catch (error) {
        console.error('Error checking register status:', error);
        // On error, show welcome screen to be safe
        setShowWelcome(true);
      } finally {
        setIsCheckingRegister(false);
      }
    };

    checkRegisterStatus();
  }, [onComplete]);

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



  const handleWelcomeYes = () => {
    setShowWelcome(false);
    setShowCashInput(true);
  };

  const handleWelcomeNo = () => {
    // User chose not to start register, just close the popup without redirecting
    onComplete(false);
  };


  const handleSave = async () => {
    if (openingCash === '' || openingCash === null || openingCash === undefined) {
      setError('Please enter opening cash amount');
      return;
    }
    
    const cashAmount = parseFloat(openingCash);
    if (isNaN(cashAmount) || cashAmount < 0) {
      setError('Please enter a valid opening cash amount (0 or greater)');
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
        onComplete(true); // Navigate to sales after successful register creation
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

  const handleCancel = () => {
    // Close the modal without creating a register
    onComplete(false);
  };

  // Show loading state while checking register
  if (isCheckingRegister) {
    return (
      <div className="fixed inset-0 bg-[#0000009a] bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl w-full max-w-md transform transition-all duration-300">
          <div className="bg-[#032D3A] p-4 flex justify-center items-center">
            <h3 className="text-white font-bold text-lg">Checking Register Status</h3>
          </div>
          <div className="p-6 text-center">
            <div className="w-8 h-8 border-4 border-[#032D3A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0000009a] bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl w-full max-w-md transform transition-all duration-300">
        {/* Header - No close button */}
        <div className="bg-[#032D3A] p-4 flex justify-center items-center">
          <h3 className="text-white font-bold text-lg">
            {showWelcome ? 'Welcome' : 'Register Cash Drawer'}
          </h3>
        </div>

        {/* Content */}
        <div className="p-6">
          {showWelcome ? (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-blue-500" />
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">
                Welcome, {userName}!
              </h4>
              <p className="text-gray-600 mb-6">
                Do you want to start register?
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleWelcomeNo}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  No
                </button>
                <button
                  onClick={handleWelcomeYes}
                  className="bg-[#032D3A] hover:bg-[#2d5a87] text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  Yes
                </button>
              </div>
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
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={openingCash === '' || openingCash === null || openingCash === undefined || isSaving}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors ${
                    openingCash !== '' && openingCash !== null && openingCash !== undefined && !isSaving
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