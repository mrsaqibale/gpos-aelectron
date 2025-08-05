import React, { useState } from 'react';
import { X, Shield, Phone, Crown, Settings, DollarSign, Scissors, ChefHat, AlertCircle } from 'lucide-react';

// Custom styles for scrollbar
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #032D3A;
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #4a7ca3;
    border-radius: 10px;
    border: 1px solid #2d5a87;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #2d5a87;
  }
  
  .custom-scrollbar::-webkit-scrollbar-corner {
    background: #032D3A;
  }
`;

// Step 1: Role Selection Modal
const ResetPinStep1 = ({ isOpen, onClose, onNext, resetFields }) => {
  const [selectedRole, setSelectedRole] = useState('');

  const roles = [
    { id: 'admin', name: 'Admin', icon: Crown },
    { id: 'manager', name: 'Manager', icon: Settings },
    { id: 'cashier', name: 'Cashier', icon: DollarSign, subtitle: 'Multiple Users' },
    { id: 'waiter', name: 'Waiter', icon: Scissors, subtitle: 'Multiple Users' },
    { id: 'chef', name: 'Chef', icon: ChefHat }
  ];

  React.useEffect(() => {
    if (resetFields) {
      setSelectedRole('');
    }
  }, [resetFields]);

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setTimeout(() => {
      onNext({ role: roleId });
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="fixed inset-0 bg-[#00000094] bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-[#032D3A] rounded-xl w-full max-w-md mx-auto relative border border-[#4a7ca3]">
          <div className="p-4">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-300 hover:text-white transition-colors z-10 border border-[#4a7ca3] rounded-lg w-7 h-7 flex items-center justify-center hover:bg-[#2d5a87]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-[#2d5a87] rounded-lg flex items-center justify-center mx-auto mb-3 border border-[#4a7ca3]">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Reset PIN</h2>
              <p className="text-xs text-gray-300">Step 1 of 4</p>
            </div>

            <div className="mb-4">
              <h3 className="text-md font-semibold text-white mb-3 text-center">Select Your Role</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {roles.map((role) => {
                  const IconComponent = role.icon;
                  const isSelected = selectedRole === role.id;
                  
                  return (
                    <button
                      key={role.id}
                      onClick={() => handleRoleSelect(role.id)}
                      className={`
                        ${isSelected ? 'border-2 border-[#4a7ca3] bg-[#2d5a87] text-white' : 'border-[#1e3a5f] text-white'}
                        p-3 rounded-lg transition-all duration-200
                        flex flex-col items-center justify-center h-20 hover:cursor-pointer 
                        bg-[#032D3A] hover:bg-[#2d5a87] border
                      `}
                    >
                      <IconComponent className="w-5 h-5 mb-1" />
                      <span className="text-sm font-bold">{role.name}</span>
                      {role.subtitle && (
                        <span className="text-xs opacity-70">{role.subtitle}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Step 2: Phone Number Entry with Number Pad
const ResetPinStep2 = ({ isOpen, onClose, onNext, userInfo, resetFields }) => {
  const [phoneNumber, setPhoneNumber] = useState('');

  React.useEffect(() => {
    if (resetFields) {
      setPhoneNumber('');
    }
  }, [resetFields]);

  const handleNumberClick = (number) => {
    if (phoneNumber.length < 11) {
      setPhoneNumber(prev => prev + number);
    }
  };

  const handleClear = () => {
    setPhoneNumber('');
  };

  const handleBackspace = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleSendOTP = () => {
    if (phoneNumber.length >= 10) {
      onNext({ ...userInfo, phoneNumber });
    }
  };

  const NumberButton = ({ number, onClick, className = "" }) => (
    <button
      onClick={() => onClick(number)}
      className={`h-9 bg-[#032D3A] border-[#2d5a87] rounded-lg text-sm font-bold transition-all duration-200 border cursor-pointer text-white hover:bg-[#2d5a87] hover:border-[#4a7ca3] ${className}`}
    >
      {number}
    </button>
  );

  const ActionButton = ({ onClick, className = "", children, variant = "default" }) => {
    const baseClasses = "h-9 rounded-lg text-xs font-semibold transition-all duration-200 border flex items-center justify-center";
    const variantClasses = {
      clear: "bg-red-900/40 hover:bg-red-800/50 border-[#4a7ca3] cursor-pointer text-red-300 hover:border-red-500",
      backspace: "bg-[#032D3A] hover:bg-[#2d5a87] border-[#4a7ca3] cursor-pointer text-white hover:border-[#4a7ca3]",
      default: baseClasses
    };

    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      >
        {children}
      </button>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="fixed inset-0 bg-[#00000094] bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-[#032D3A] rounded-xl w-full max-w-md mx-auto relative border border-[#4a7ca3]">
          <div className="p-4">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-300 hover:text-white transition-colors z-10 border border-[#4a7ca3] rounded-lg w-7 h-7 flex items-center justify-center hover:bg-[#2d5a87]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-[#2d5a87] rounded-lg flex items-center justify-center mx-auto mb-3 border border-[#4a7ca3]">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Reset PIN</h2>
              <p className="text-xs text-gray-300">Step 2 of 4</p>
            </div>

            <div className="mb-4">
              <h3 className="text-md font-semibold text-white mb-3 text-center">Enter Phone Number</h3>
              
              <p className="text-xs text-gray-300 mb-3 text-center">
                Role: <span className="text-white font-semibold">{userInfo?.role}</span>
              </p>

              {/* Phone Number Display */}
              <div className="mb-4">
                <div className="flex justify-center items-center gap-2 mb-1">
                  <div className="flex items-center bg-[#1e3a5f] border border-[#2d5a87] rounded-lg px-3 py-2 min-w-[180px]">
                    <Phone className="w-4 h-4 text-gray-300 mr-2" />
                    <span className="text-white font-mono text-sm">
                      {phoneNumber || "Enter phone number"}
                    </span>
                  </div>
                </div>
                <p className="text-center text-xs text-gray-400">
                  {phoneNumber.length}/11 digits
                </p>
              </div>

              {/* Number Pad */}
              <div className="max-w-xs mx-auto mb-4">
                {/* First 3 rows */}
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                    <NumberButton
                      key={number}
                      number={number}
                      onClick={handleNumberClick}
                    />
                  ))}
                </div>
                
                {/* Bottom row */}
                <div className="grid grid-cols-3 gap-2">
                  <ActionButton
                    onClick={handleClear}
                    variant="clear"
                  >
                    Clear
                  </ActionButton>
                  
                  <NumberButton
                    number={0}
                    onClick={handleNumberClick}
                  />
                  
                  <ActionButton
                    onClick={handleBackspace}
                    variant="backspace"
                  >
                    <X className="w-3 h-3" />
                  </ActionButton>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleSendOTP}
                  disabled={phoneNumber.length < 10}
                  className={`px-6 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                    phoneNumber.length >= 10
                      ? 'bg-[#2d5a87] border-[#4a7ca3] text-white hover:bg-[#4a7ca3] cursor-pointer'
                      : 'bg-[#1e3a5f] border-[#4a7ca3] text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Send OTP
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Step 3: OTP Verification with Number Pad
const ResetPinStep3 = ({ isOpen, onClose, onNext, userInfo, resetFields }) => {
  const [otp, setOtp] = useState('');

  React.useEffect(() => {
    if (resetFields) {
      setOtp('');
    }
  }, [resetFields]);

  const handleNumberClick = (number) => {
    if (otp.length < 6) {
      setOtp(prev => prev + number);
    }
  };

  const handleClear = () => {
    setOtp('');
  };

  const handleBackspace = () => {
    setOtp(prev => prev.slice(0, -1));
  };

  const handleVerifyOTP = () => {
    if (otp.length === 6) {
      onNext();
    }
  };

  const NumberButton = ({ number, onClick, className = "" }) => (
    <button
      onClick={() => onClick(number)}
      className={`h-9 bg-[#032D3A] border-[#2d5a87] rounded-lg text-sm font-bold transition-all duration-200 border cursor-pointer text-white hover:bg-[#2d5a87] hover:border-[#4a7ca3] ${className}`}
    >
      {number}
    </button>
  );

  const ActionButton = ({ onClick, className = "", children, variant = "default" }) => {
    const baseClasses = "h-9 rounded-lg text-xs font-semibold transition-all duration-200 border flex items-center justify-center";
    const variantClasses = {
      clear: "bg-red-900/40 hover:bg-red-800/50 border-[#4a7ca3] cursor-pointer text-red-300 hover:border-red-500",
      backspace: "bg-[#032D3A] hover:bg-[#2d5a87] border-[#4a7ca3] cursor-pointer text-white hover:border-[#4a7ca3]",
      default: baseClasses
    };

    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      >
        {children}
      </button>
    );
  };

  const renderOtpDisplay = () => {
    const boxes = Array.from({ length: 6 }, (_, index) => {
      const hasDigit = index < otp.length;
      const digit = otp[index] || '';
      const isEmpty = !hasDigit;
      
      return (
        <div 
          key={index} 
          className={`w-8 h-8 border rounded-lg flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
            isEmpty 
              ? 'border-[#1e3a5f] bg-[#0f2a44]' 
              : 'border-[#2d5a87] bg-[#032D3A] text-white'
          }`}
        >
          {hasDigit ? digit : ''}
        </div>
      );
    });

    return (
      <div className="flex justify-center items-center gap-2">
        {boxes}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="fixed inset-0 bg-[#00000094] bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-[#032D3A] rounded-xl w-full max-w-md mx-auto relative border border-[#4a7ca3]">
          <div className="p-4">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-300 hover:text-white transition-colors z-10 border border-[#4a7ca3] rounded-lg w-7 h-7 flex items-center justify-center hover:bg-[#2d5a87]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-[#2d5a87] rounded-lg flex items-center justify-center mx-auto mb-3 border border-[#4a7ca3]">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Reset PIN</h2>
              <p className="text-xs text-gray-300">Step 3 of 4</p>
            </div>

            <div className="mb-4">
              <h3 className="text-md font-semibold text-white mb-3 text-center">Enter OTP</h3>
              
              <p className="text-xs text-gray-300 mb-3 text-center">
                OTP sent to: <span className="text-white font-semibold">{userInfo?.phoneNumber}</span>
              </p>

              {/* OTP Display */}
              <div className="mb-3">
                {renderOtpDisplay()}
                <p className="text-center text-xs text-gray-400 mt-1">
                  {otp.length}/6 digits
                </p>
              </div>

              {/* Number Pad */}
              <div className="max-w-xs mx-auto mb-4">
                {/* First 3 rows */}
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                    <NumberButton
                      key={number}
                      number={number}
                      onClick={handleNumberClick}
                    />
                  ))}
                </div>
                
                {/* Bottom row */}
                <div className="grid grid-cols-3 gap-2">
                  <ActionButton
                    onClick={handleClear}
                    variant="clear"
                  >
                    Clear
                  </ActionButton>
                  
                  <NumberButton
                    number={0}
                    onClick={handleNumberClick}
                  />
                  
                  <ActionButton
                    onClick={handleBackspace}
                    variant="backspace"
                  >
                    <X className="w-3 h-3" />
                  </ActionButton>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleVerifyOTP}
                  disabled={otp.length !== 6}
                  className={`px-6 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                    otp.length === 6
                      ? 'bg-[#2d5a87] border-[#4a7ca3] text-white hover:bg-[#4a7ca3] cursor-pointer'
                      : 'bg-[#1e3a5f] border-[#4a7ca3] text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Verify OTP
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Step 4: Set New PIN with Number Pad
const ResetPinStep4 = ({ isOpen, onClose, onComplete, resetFields }) => {
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isConfirmMode, setIsConfirmMode] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (resetFields) {
      setNewPin('');
      setConfirmPin('');
      setIsConfirmMode(false);
      setError('');
    }
  }, [resetFields]);

  const handleNumberClick = (number) => {
    if (!isConfirmMode) {
      if (newPin.length < 6) {
        setNewPin(prev => prev + number);
      }
    } else {
      if (confirmPin.length < 6) {
        setConfirmPin(prev => prev + number);
        setError(''); // Clear error when typing
      }
    }
  };

  const handleClear = () => {
    if (!isConfirmMode) {
      setNewPin('');
    } else {
      setConfirmPin('');
      setError('');
    }
  };

  const handleBackspace = () => {
    if (!isConfirmMode) {
      setNewPin(prev => prev.slice(0, -1));
    } else {
      setConfirmPin(prev => prev.slice(0, -1));
      setError('');
    }
  };

  const handleContinue = () => {
    if (!isConfirmMode) {
      if (newPin.length < 4) {
        setError('PIN must be at least 4 digits');
        return;
      }
      setIsConfirmMode(true);
      setError('');
    } else {
      if (confirmPin.length < 4) {
        setError('PIN must be at least 4 digits');
        return;
      }
      if (newPin !== confirmPin) {
        setError('PINs do not match');
        return;
      }
      onComplete();
    }
  };

  const NumberButton = ({ number, onClick, className = "" }) => (
    <button
      onClick={() => onClick(number)}
      className={`h-9 bg-[#032D3A] border-[#2d5a87] rounded-lg text-sm font-bold transition-all duration-200 border cursor-pointer text-white hover:bg-[#2d5a87] hover:border-[#4a7ca3] ${className}`}
    >
      {number}
    </button>
  );

  const ActionButton = ({ onClick, className = "", children, variant = "default" }) => {
    const baseClasses = "h-9 rounded-lg text-xs font-semibold transition-all duration-200 border flex items-center justify-center";
    const variantClasses = {
      clear: "bg-red-900/40 hover:bg-red-800/50 border-[#4a7ca3] cursor-pointer text-red-300 hover:border-red-500",
      backspace: "bg-[#032D3A] hover:bg-[#2d5a87] border-[#4a7ca3] cursor-pointer text-white hover:border-[#4a7ca3]",
      default: baseClasses
    };

    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      >
        {children}
      </button>
    );
  };

  const renderPinDisplay = (pin, label) => {
    const boxes = Array.from({ length: 6 }, (_, index) => {
      const hasDigit = index < pin.length;
      const isEmpty = !hasDigit;
      
      return (
        <div 
          key={index} 
          className={`w-8 h-8 border rounded-lg flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
            isEmpty 
              ? 'border-[#1e3a5f] bg-[#0f2a44]' 
              : 'border-[#2d5a87] bg-[#032D3A] text-white'
          }`}
        >
          {hasDigit ? '●' : ''}
        </div>
      );
    });

    return (
      <div className="mb-3">
        <p className="text-center text-xs text-gray-300 mb-1">{label}</p>
        <div className="flex justify-center items-center gap-2">
          {boxes}
        </div>
        <p className="text-center text-xs text-gray-400 mt-1">
          {pin.length}/6 digits
        </p>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="fixed inset-0 bg-[#00000094] bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-[#032D3A] rounded-xl w-full max-w-md mx-auto relative border border-[#4a7ca3]">
          <div className="p-4">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-300 hover:text-white transition-colors z-10 border border-[#4a7ca3] rounded-lg w-7 h-7 flex items-center justify-center hover:bg-[#2d5a87]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-[#2d5a87] rounded-lg flex items-center justify-center mx-auto mb-3 border border-[#4a7ca3]">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Reset PIN</h2>
              <p className="text-xs text-gray-300">Step 4 of 4</p>
            </div>

            <div className="mb-4">
              <h3 className="text-md font-semibold text-white mb-3 text-center">
                {!isConfirmMode ? 'Set New PIN' : 'Confirm New PIN'}
              </h3>

              {/* PIN Display */}
              {!isConfirmMode ? (
                renderPinDisplay(newPin, 'Enter New PIN (4-6 digits)')
              ) : (
                renderPinDisplay(confirmPin, 'Confirm New PIN')
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-3 flex items-center justify-center gap-1 bg-red-900/40 text-red-300 p-1 rounded border border-red-600/30">
                  <AlertCircle className="w-3 h-3" />
                  <span className="text-xs font-medium">{error}</span>
                </div>
              )}

              {/* Number Pad */}
              <div className="max-w-xs mx-auto mb-4">
                {/* First 3 rows */}
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                    <NumberButton
                      key={number}
                      number={number}
                      onClick={handleNumberClick}
                    />
                  ))}
                </div>
                
                {/* Bottom row */}
                <div className="grid grid-cols-3 gap-2">
                  <ActionButton
                    onClick={handleClear}
                    variant="clear"
                  >
                    Clear
                  </ActionButton>
                  
                  <NumberButton
                    number={0}
                    onClick={handleNumberClick}
                  />
                  
                  <ActionButton
                    onClick={handleBackspace}
                    variant="backspace"
                  >
                    <X className="w-3 h-3" />
                  </ActionButton>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                {isConfirmMode && (
                  <button
                    onClick={() => {
                      setIsConfirmMode(false);
                      setConfirmPin('');
                      setError('');
                    }}
                    className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 text-gray-300 hover:text-white bg-transparent border border-[#4a7ca3] hover:bg-[#1e3a5f]"
                  >
                    Back to New PIN
                  </button>
                )}
                <button
                  onClick={handleContinue}
                  disabled={(!isConfirmMode && newPin.length < 4) || (isConfirmMode && confirmPin.length < 4)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                    ((!isConfirmMode && newPin.length >= 4) || (isConfirmMode && confirmPin.length >= 4))
                      ? 'bg-[#2d5a87] border-[#4a7ca3] text-white hover:bg-[#4a7ca3] cursor-pointer'
                      : 'bg-[#1e3a5f] border-[#4a7ca3] text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {!isConfirmMode ? 'Continue' : 'Reset PIN'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Main component that manages the forgot PIN flow
const ForgotPinModals = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userInfo, setUserInfo] = useState(null);
  const [resetFields, setResetFields] = useState(false);

  // Reset state when modal is closed or opened
  React.useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setUserInfo(null);
      setResetFields(prev => !prev); // Toggle to trigger reset
    }
  }, [isOpen]);

  const handleStep1Next = (info) => {
    setUserInfo(info);
    setCurrentStep(2);
  };

  const handleStep2Next = (info) => {
    setUserInfo(info);
    setCurrentStep(3);
  };

  const handleStep3Next = () => {
    setCurrentStep(4);
  };

  const handleResetComplete = () => {
    setCurrentStep(1);
    setUserInfo(null);
    setResetFields(prev => !prev); // Toggle to trigger reset
    alert('PIN reset successfully! You can now login with your new PIN.');
    onClose();
  };

  const handleModalClose = () => {
    setCurrentStep(1);
    setUserInfo(null);
    setResetFields(prev => !prev); // Toggle to trigger reset
    onClose();
  };

  return (
    <>
      <ResetPinStep1
        isOpen={isOpen && currentStep === 1}
        onClose={handleModalClose}
        onNext={handleStep1Next}
        resetFields={resetFields}
      />

      <ResetPinStep2
        isOpen={isOpen && currentStep === 2}
        onClose={handleModalClose}
        onNext={handleStep2Next}
        userInfo={userInfo}
        resetFields={resetFields}
      />

      <ResetPinStep3
        isOpen={isOpen && currentStep === 3}
        onClose={handleModalClose}
        onNext={handleStep3Next}
        userInfo={userInfo}
        resetFields={resetFields}
      />

      <ResetPinStep4
        isOpen={isOpen && currentStep === 4}
        onClose={handleModalClose}
        onComplete={handleResetComplete}
        resetFields={resetFields}
      />
    </>
  );
};

export default ForgotPinModals;