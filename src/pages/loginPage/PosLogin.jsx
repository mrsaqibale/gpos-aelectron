import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Crown, Settings, DollarSign, ChefHat, X, BarChart3, AlertCircle } from 'lucide-react';
import ForgotPinModals from './ForgotPassword';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const POSLogin = () => {
  console.log('POSLogin component rendering...');

  const [selectedRole, setSelectedRole] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const [showForgotPinModal, setShowForgotPinModal] = useState(false);
  const { themeColors, changeTheme } = useTheme();

  const roles = [
    { id: 'Admin', name: 'Admin', icon: Crown },
    { id: 'Manager', name: 'Manager', icon: Settings },
    { id: 'Cashier', name: 'Cashier', icon: DollarSign, subtitle: 'Multiple Users' },
    { id: 'Chef', name: 'Chef', icon: ChefHat }
  ];

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showForgotPinModal) return;

      if (e.key >= '0' && e.key <= '9') {
        handleNumberClick(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Delete') {
        handleClear();
      } else if (e.key === 'Enter') {
        handleLogin();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [pin, selectedRole, showForgotPinModal]);

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setError(''); // Clear any previous error when role is selected
  };

  const handleNumberClick = (number) => {
    if (!selectedRole) {
      setError('⚠ Please select a role first.');
      return;
    }
    if (pin.length < 4) {
      setPin(prev => prev + number);
      setError(''); // Clear error when user starts typing
    }
  };

  const handleClear = () => {
    setPin('');
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleLogin = async () => {
    if (!selectedRole) {
      setError('⚠ Please select a role first.');
      return;
    }
    if (pin.length < 4) {
      setError('⚠ PIN must be 4 digits.');
      return;
    }
    if (selectedRole && pin.length >= 4) {
      try {
        console.log('Login attempt:', { role: selectedRole, pin });

        // Call the backend login function
        const result = await window.myAPI?.loginEmployee(pin, selectedRole);

        if (result.success) {
          console.log('Login successful:', result.data);
          
          // Create employee login session after successful authentication
          try {
            const loginSessionResult = await window.myAPI?.createEmployeeLogin(result.data.id);
            if (loginSessionResult.success) {
              console.log('Employee login session created:', loginSessionResult);
              // Store login session data along with employee data
              localStorage.setItem('currentEmployee', JSON.stringify({
                ...result.data,
                loginSessionId: loginSessionResult.login_id,
                loginTime: loginSessionResult.login_time
              }));
            } else {
              console.warn('Failed to create login session:', loginSessionResult.message);
              // Still proceed with login even if session creation fails
              localStorage.setItem('currentEmployee', JSON.stringify(result.data));
            }
          } catch (sessionError) {
            console.error('Error creating login session:', sessionError);
            // Still proceed with login even if session creation fails
            localStorage.setItem('currentEmployee', JSON.stringify(result.data));
          }
          
          navigate('/dashboard');
        } else {
          setError('⚠ Invalid PIN or role. Please try again.');
          setPin(''); // Clear PIN on failed attempt
        }
      } catch (error) {
        console.error('Login error:', error);
        setError('⚠ Login failed. Please try again.');
        setPin(''); // Clear PIN on error
      }
    }
  };

  const togglePinVisibility = () => {
    setShowPin(!showPin);
  };

  const getSelectedRoleName = () => {
    const role = roles.find(r => r.id === selectedRole);
    return role ? role.name : '';
  };

  const handleForgotPinClick = () => {
    setShowForgotPinModal(true);
  };

  const handleForgotPinClose = () => {
    setShowForgotPinModal(false);
  };

  // Utility function to handle employee logout (can be used from other components)
  const handleEmployeeLogout = async (employeeId) => {
    try {
      if (employeeId) {
        const logoutResult = await window.myAPI?.updateEmployeeLogout(employeeId);
        if (logoutResult.success) {
          console.log('Employee logout session updated:', logoutResult);
        } else {
          console.warn('Failed to update logout session:', logoutResult.message);
        }
      }
    } catch (error) {
      console.error('Error updating logout session:', error);
    }
  };

  // Expose logout function globally for use in other components
  React.useEffect(() => {
    window.handleEmployeeLogout = handleEmployeeLogout;
    return () => {
      delete window.handleEmployeeLogout;
    };
  }, []);

  const renderPinDisplay = () => {
    const boxes = Array.from({ length: 4 }, (_, index) => {
      const hasDigit = index < pin.length;
      const digit = pin[index] || '';
      const isEmpty = !hasDigit;

      return (
        <div
          key={index}
          className={`w-10 h-10 border-[2px] rounded-lg flex items-center justify-center text-lg font-semibold transition-all duration-200 ${isEmpty
              ? 'border-[#6BD8E6] bg-[#E0F7FA]'
              : 'border-[#6BD8E6] bg-[#E0F7FA] text-black'
            } shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]`}
            style={{
              boxShadow: "0 0 10px rgba(0, 188, 212, 0.6)"
            }}
        >
          {hasDigit ? (showPin ? digit : '●') : ''}
        </div>
      );
    });

    return (
      <div className="flex justify-center items-center gap-2">
        {boxes}
        <button
          onClick={togglePinVisibility}
          disabled={!selectedRole}
          className={`ml-1 w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${selectedRole
              ? 'text-[#032D3A] hover:text-white hover:bg-[#032D3A] cursor-pointer'
              : 'text-[#032D3A] cursor-not-allowed'
            }`}
        >
          {showPin ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
        </button>
      </div>
    );
  };

    const NumberButton = ({ number, onClick, style }) => (
      <button
        onClick={() => onClick(number)}
        disabled={!selectedRole}
        className="rounded-xl py-2 px-4 shadow-lg cursor-pointer hover:shadow-xl font-bold text-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
        style={{
          backgroundColor: 'white',
          color: themeColors.primary,
          border: `2px solid ${themeColors.primary}`
        }}
      >
        {number}
      </button>
    );

  const ActionButton = ({
    onClick,
    className = "",
    children,
    variant = "default",
    disabled = false,
  }) => {
    const baseClasses =
      "h-11 rounded-lg text-sm font-semibold transition-all duration-200 border-[1.5px] flex items-center justify-center shadow-md hover:shadow-lg active:shadow-inner active:translate-y-0.5";

    const buttonStyle = {
      backgroundColor: selectedRole ? themeColors.primary : 'white',
      color: selectedRole ? 'white' : themeColors.primary,
      border: selectedRole ? 'none' : `2px solid ${themeColors.primary}`,
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} ${className}`}
        style={buttonStyle}
      >
        {children}
      </button>
      );
  };


  return (
    <>
      <div
        className="w-full min-h-screen relative flex flex-col items-center justify-center px-6 py-3 transition-colors duration-300"
        style={{ backgroundColor: 'white' }}
      >

        <div className="py-6 rounded-t-xl">
          <div className="absolute top-4 right-6 flex gap-2">
           <button
              onClick={() => changeTheme("default")}
              className="w-5 h-5 rounded-full border border-white cursor-pointer transform active:scale-95"
              style={{ background: "linear-gradient(to bottom right, #003E5C, #1976d2)" }}
            />
            <button
              onClick={() => changeTheme("blue")}
              className="w-5 h-5 rounded-full border border-white cursor-pointer transform active:scale-95"
              style={{ background: "linear-gradient(to bottom right, #176B87, #3498db)" }}
            />
            <button
              onClick={() => changeTheme("green")}
              className="w-5 h-5 rounded-full border border-white cursor-pointer transform active:scale-95"
              style={{ background: "linear-gradient(to bottom right, #25A18E, #34A0A4)" }}
            />
          </div>


          <div
            className="flex flex-col items-center justify-center text-center mt-6"
          >
            <div className="w-24 h-20 rounded-2xl border-2 flex flex-col items-center justify-center mb-3 shadow-md shadow-black"
            style={{ backgroundColor: themeColors.logo, borderColor: themeColors.logo_border  }} 
            >
              <span className="text-white font-bold text-5xl">G</span>
              <span className="text-white font-medium text-base">POS</span>
            </div>
            <p className="text-xl text-white font-semibold mb-2">
              Smart Restaurant Billing System
            </p>
            <p className="text-lg text-black font-bold">
              Welcome to GPOS – Smart & Simplified Point of Sale
            </p>
          </div>

        </div>


        {/* Main Content */}
        <div className="w-full max-w-4xl flex transform perspective-1000">

                      {/* Left Section - Role Selection with 3D effect */}
            <div className="w-1/2 rounded-l-3xl border-r p-6 border-[#4a7ca3] border shadow-2xl" style={{ backgroundColor: themeColors.primary }}>
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Select Your Role
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {roles.map((role) => {
                const IconComponent = role.icon;
                const isSelected = selectedRole === role.id;

                return (
                  
                  <button
                      key={role.id}
                      onClick={() => handleRoleSelect(role.id)}
                      className={`
                        ${isSelected
                          ? 'text-white scale-[1.04] z-[1]'
                          : 'text-black hover:bg-transparent hover:border-white'}
                        p-4 rounded-xl transition-all duration-300 
                        flex flex-col items-center justify-center h-24 
                        hover:cursor-pointer transform hover:-translate-y-1 hover:scale-105 active:translate-y-0 
                        border-[2.5px]
                      `}
                                                                                              style={{
                          transformStyle: 'preserve-3d',
                          background: isSelected ? themeColors.primary : 'white',
                          borderColor: isSelected ? themeColors.loginBg : '#1e3a5f',
                          boxShadow: isSelected
                            ? `0 0 16px 2px ${themeColors.loginBg}, 0 0 0 4px rgba(52, 160, 164, 0.12)`
                            : '0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -1px rgba(0,0,0,0.1)'
                        }}
                    >
                      <IconComponent className="w-6 h-6 mb-1" style={{ color: isSelected ? 'white' : 'black' }} />
                      <span className="text-md font-bold" style={{ color: isSelected ? 'white' : 'black' }}>{role.name}</span>
                                              {role.subtitle && (
                          <span className="text-xs opacity-70" style={{ color: isSelected ? 'white' : 'black' }}>{role.subtitle}</span>
                        )}
                    </button>

                );
              })}
            </div>
          </div>

          {/* Right Section - PIN Entry with 3D effect */}
          <div
            className="w-1/2 bg-[#ffffff] text-black rounded-r-3xl border-l p-6 shadow-2xl border-1 border-[#2d5a87]"
            style={{
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
            }}
          >
            {/* Logging in as Role Header */}
            {selectedRole && (
              <div className="mb-3 p-2] rounded-md border border-[#4a7ca3] shadow-inner max-w-xs mx-auto">
                <div className="flex items-center justify-center gap-1 text-black">
                  <BarChart3 className="w-3 h-3" />
                  <span className="text-sm font-medium">
                    Logging in as: {getSelectedRoleName()}
                  </span>
                </div>
              </div>
            )}

            <h2 className="text-2xl font-semibold text-black mb-6 text-center transform transition-transform hover:scale-105">
              Enter PIN To Continue
            </h2>

            {/* PIN Display */}
            <div className="mb-4">
              {renderPinDisplay()}
              <p className="text-center text-xs text-gray-400 mt-2">
                {pin.length}/4 digits
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 mx-10 flex items-center justify-center gap-2 bg-white text-red-500 p-2 rounded-lg border border-red-500">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Number Pad with 3D buttons */}
            <div className="max-w-xs mx-auto mb-4">
              {/* First 3 rows */}
              <div className="grid grid-cols-3 gap-3 mb-3 text-white cursor-pointer">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                                     <NumberButton
                     key={number}
                     number={number}
                     onClick={handleNumberClick}
                     style={{
                       start: themeColors.keypad,
                       end: themeColors.keypad_end,
                     }}
                   />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                  <ActionButton
                    onClick={handleClear}
                    variant="clear"
                    disabled={!selectedRole}
                  >
                    Clear
                  </ActionButton>
                                     <NumberButton
                     number={0}
                     onClick={handleNumberClick}
                     style={{
                       start: themeColors.keypad,
                       end: themeColors.keypad_end,
                     }}
                   />

                  <ActionButton
                    onClick={handleBackspace}
                    variant="backspace"
                    disabled={!selectedRole}
                                         style={{
                       backgroundColor: themeColors.primary
                     }}
                  >
                    <X className="w-4 h-4" />
                  </ActionButton>
                </div>

            </div>

            {/* Login Button with 3D effect */}
            <div className="mb-4 flex justify-center">
              <button
                onClick={handleLogin}
                disabled={!selectedRole || pin.length < 4}
                className="w-[86%] bg-[#2d5a87] cursor-pointer hover:bg-[#4a7ca3] text-white py-3 rounded-lg text-base font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 active:shadow-inner border border-[#4a7ca3]"
                                 style={{
                     backgroundColor: themeColors.primary,
                     borderColor: themeColors.loginBg,
                   }}
              >
                Login
              </button>

            </div>

            {/* Forgot PIN */}
            <div className="text-center">
              <button
                onClick={handleForgotPinClick}
                className="text-gray-300 hover:text-white text-underline cursor-pointer text-sm font-bold transition-colors hover:-translate-y-0.5"
                                 style={{
                     color: themeColors.primary,
                   }}
              >
                Forgot PIN?
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot PIN Modals */}
      <ForgotPinModals
        isOpen={showForgotPinModal}
        onClose={handleForgotPinClose}
      />

    </>
  );
};

export default POSLogin;
